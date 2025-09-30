"""
Gemini API service for finding neutralizing songs based on emotions with API key rotation
"""
import json
import re
import google.generativeai as genai
from config import GEMINI_API_KEYS, CURRENT_API_KEY_INDEX, EMOTION_NEUTRALIZATION_PROMPTS

class GeminiMusicService:
    def __init__(self):
        self.api_keys = GEMINI_API_KEYS
        self.current_key_index = CURRENT_API_KEY_INDEX
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the model with the current API key"""
        try:
            current_key = self.api_keys[self.current_key_index]
            genai.configure(api_key=current_key)
            self.model = genai.GenerativeModel('gemini-pro')
            print(f"✅ Initialized Gemini with API key #{self.current_key_index + 1}")
        except Exception as e:
            print(f"❌ Error initializing with key #{self.current_key_index + 1}: {e}")
            self._rotate_api_key()
    
    def _rotate_api_key(self):
        """Rotate to the next API key"""
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        print(f"🔄 Rotating to API key #{self.current_key_index + 1}")
        
        if self.current_key_index == 0:
            print("⚠️ All API keys have been tried once")
        
        try:
            current_key = self.api_keys[self.current_key_index]
            genai.configure(api_key=current_key)
            self.model = genai.GenerativeModel('gemini-pro')
            print(f"✅ Successfully switched to API key #{self.current_key_index + 1}")
        except Exception as e:
            print(f"❌ Error with key #{self.current_key_index + 1}: {e}")
            if self.current_key_index != 0:  # Avoid infinite recursion
                self._rotate_api_key()
    
    def get_neutralizing_songs(self, emotion: str, max_results: int = 5):
        """
        Get songs that can help neutralize the given emotion using Gemini AI with API key rotation
        
        Args:
            emotion (str): The detected emotion
            max_results (int): Maximum number of songs to return
            
        Returns:
            list: List of dictionaries containing song name, artist, and YouTube link
        """
        max_retries = len(self.api_keys)
        
        for attempt in range(max_retries):
            try:
                if not self.model:
                    self._initialize_model()
                
                # Get the appropriate music description for the emotion
                music_description = EMOTION_NEUTRALIZATION_PROMPTS.get(emotion.lower(), "relaxing music")
                
                # Create a detailed prompt for Gemini with better formatting
                prompt = f"""
                I need exactly {max_results} song recommendations for someone feeling {emotion}. 
                The songs should be {music_description}.
                
                Please provide the response in this exact JSON format:
                {{
                    "songs": [
                        {{
                            "song_title": "Song Title",
                            "artist": "Artist Name", 
                            "link": "https://www.youtube.com/watch?v=VIDEO_ID"
                        }}
                    ]
                }}
                
                Requirements:
                - Provide real, popular songs that exist on YouTube
                - Separate song title and artist name clearly
                - Provide actual YouTube links with real video IDs
                - Focus on well-known songs that would help with {emotion} emotion
                - Make sure all songs are appropriate for emotional regulation
                - Use popular, mainstream songs that people would recognize
                """
                
                response = self.model.generate_content(prompt)
                
                # Parse the response
                response_text = response.text.strip()
                
                # Extract JSON from the response
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group()
                    data = json.loads(json_str)
                    songs = data.get('songs', [])
                    
                    # Convert to our expected format and validate
                    formatted_songs = []
                    for song in songs:
                        if isinstance(song, dict):
                            formatted_song = {
                                "song_name": f"{song.get('song_title', 'Unknown')} - {song.get('artist', 'Unknown Artist')}",
                                "artist": song.get('artist', 'Unknown Artist'),
                                "song_title": song.get('song_title', 'Unknown'),
                                "link": song.get('link', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                            }
                            formatted_songs.append(formatted_song)
                    
                    if formatted_songs:
                        print(f"✅ Successfully got {len(formatted_songs)} songs from Gemini")
                        return formatted_songs
                else:
                    # Fallback: parse manually if JSON format is not perfect
                    return self._parse_fallback_response(response_text, max_results)
                    
            except Exception as e:
                print(f"❌ Error with API key #{self.current_key_index + 1}: {e}")
                
                # Check if it's a quota/rate limit error
                if "quota" in str(e).lower() or "limit" in str(e).lower() or "exhausted" in str(e).lower():
                    print(f"🔄 API key #{self.current_key_index + 1} exhausted, rotating...")
                    self._rotate_api_key()
                else:
                    break
        
        print("⚠️ All API keys failed, using fallback songs")
        return self._get_fallback_songs(emotion, max_results)
    
    def _parse_fallback_response(self, response_text: str, max_results: int):
        """Fallback parser if JSON format is not perfect"""
        songs = []
        lines = response_text.split('\n')
        
        for line in lines:
            if 'youtube.com' in line.lower() or 'youtu.be' in line.lower():
                # Try to extract song name and link
                if '-' in line:
                    parts = line.split('-', 1)
                    if len(parts) >= 2:
                        song_name = parts[0].strip().strip('"').strip("'")
                        link_part = parts[1].strip()
                        
                        # Extract URL
                        url_match = re.search(r'https?://[^\s]+', link_part)
                        if url_match:
                            link = url_match.group()
                            songs.append({
                                "song_name": song_name,
                                "link": link
                            })
                            
                if len(songs) >= max_results:
                    break
        
        return songs[:max_results]
    
    def _get_fallback_songs(self, emotion: str, max_results: int):
        """Fallback songs if Gemini API fails with proper artist separation"""
        fallback_songs = {
            "angry": [
                {"song_name": "Weightless - Marconi Union", "artist": "Marconi Union", "song_title": "Weightless", "link": "https://www.youtube.com/watch?v=UfcAVejslrU"},
                {"song_name": "Clair de Lune - Claude Debussy", "artist": "Claude Debussy", "song_title": "Clair de Lune", "link": "https://www.youtube.com/watch?v=CvFH_6DNRCY"},
                {"song_name": "Aqueous Transmission - Incubus", "artist": "Incubus", "song_title": "Aqueous Transmission", "link": "https://www.youtube.com/watch?v=eQK7KSTQfaw"},
                {"song_name": "Mad World - Gary Jules", "artist": "Gary Jules", "song_title": "Mad World", "link": "https://www.youtube.com/watch?v=4N3N1MlvVc4"},
                {"song_name": "The Sound of Silence - Simon & Garfunkel", "artist": "Simon & Garfunkel", "song_title": "The Sound of Silence", "link": "https://www.youtube.com/watch?v=4fWyzwo1xg0"}
            ],
            "sad": [
                {"song_name": "Happy - Pharrell Williams", "artist": "Pharrell Williams", "song_title": "Happy", "link": "https://www.youtube.com/watch?v=ZbZSe6N_BXs"},
                {"song_name": "Good Vibrations - The Beach Boys", "artist": "The Beach Boys", "song_title": "Good Vibrations", "link": "https://www.youtube.com/watch?v=Eab_beh07HU"},
                {"song_name": "Don't Stop Me Now - Queen", "artist": "Queen", "song_title": "Don't Stop Me Now", "link": "https://www.youtube.com/watch?v=HgzGwKwLmgM"},
                {"song_name": "Walking on Sunshine - Katrina and the Waves", "artist": "Katrina and the Waves", "song_title": "Walking on Sunshine", "link": "https://www.youtube.com/watch?v=iPUmE-tne5U"},
                {"song_name": "I Can See Clearly Now - Johnny Nash", "artist": "Johnny Nash", "song_title": "I Can See Clearly Now", "link": "https://www.youtube.com/watch?v=MrHxhQPOO2c"}
            ],
            "fear": [
                {"song_name": "Stronger - Kelly Clarkson", "artist": "Kelly Clarkson", "song_title": "Stronger", "link": "https://www.youtube.com/watch?v=Xn676-fLq7I"},
                {"song_name": "Fight Song - Rachel Platten", "artist": "Rachel Platten", "song_title": "Fight Song", "link": "https://www.youtube.com/watch?v=xo1VInw-SKc"},
                {"song_name": "Roar - Katy Perry", "artist": "Katy Perry", "song_title": "Roar", "link": "https://www.youtube.com/watch?v=CevxZvSJLk8"},
                {"song_name": "Brave - Sara Bareilles", "artist": "Sara Bareilles", "song_title": "Brave", "link": "https://www.youtube.com/watch?v=QUQsqBqxoR4"},
                {"song_name": "Confident - Demi Lovato", "artist": "Demi Lovato", "song_title": "Confident", "link": "https://www.youtube.com/watch?v=cwjjSmwc5ME"}
            ],
            "happy": [
                {"song_name": "Relaxing Piano - Various Artists", "artist": "Various Artists", "song_title": "Relaxing Piano", "link": "https://www.youtube.com/watch?v=1ZYbU82GVz4"},
                {"song_name": "Chill Vibes - Lofi Hip Hop", "artist": "Lofi Hip Hop", "song_title": "Chill Vibes", "link": "https://www.youtube.com/watch?v=5qap5aO4i9A"},
                {"song_name": "Good as Hell - Lizzo", "artist": "Lizzo", "song_title": "Good as Hell", "link": "https://www.youtube.com/watch?v=SmbmeOgWsqE"},
                {"song_name": "Can't Stop the Feeling - Justin Timberlake", "artist": "Justin Timberlake", "song_title": "Can't Stop the Feeling", "link": "https://www.youtube.com/watch?v=ru0K8uYEZWw"},
                {"song_name": "Uptown Funk - Mark Ronson ft. Bruno Mars", "artist": "Mark Ronson ft. Bruno Mars", "song_title": "Uptown Funk", "link": "https://www.youtube.com/watch?v=OPf0YbXqDm0"}
            ]
        }
        
        default_songs = [
            {"song_name": "Relaxing Piano Music - Various Artists", "artist": "Various Artists", "song_title": "Relaxing Piano Music", "link": "https://www.youtube.com/watch?v=1ZYbU82GVz4"},
            {"song_name": "Peaceful Nature Sounds - Nature Sounds", "artist": "Nature Sounds", "song_title": "Peaceful Nature Sounds", "link": "https://www.youtube.com/watch?v=eKFTSSKCzWA"},
            {"song_name": "Meditation Music - Meditation Relax Music", "artist": "Meditation Relax Music", "song_title": "Meditation Music", "link": "https://www.youtube.com/watch?v=lFcSrYw-ARY"},
            {"song_name": "Calm Instrumental - Peaceful Music", "artist": "Peaceful Music", "song_title": "Calm Instrumental", "link": "https://www.youtube.com/watch?v=M4QCh-yIPzA"},
            {"song_name": "Soothing Sounds - Relaxing Music", "artist": "Relaxing Music", "song_title": "Soothing Sounds", "link": "https://www.youtube.com/watch?v=nDq6TstdEi8"}
        ]
        
        return fallback_songs.get(emotion.lower(), default_songs)[:max_results]
    
    def get_emotion_explanation(self, emotion: str):
        """
        Get explanation of why certain music helps with the emotion
        
        Args:
            emotion (str): The detected emotion
            
        Returns:
            str: Explanation text
        """
        explanations = {
            "angry": "Calm and peaceful music can help reduce anger and promote relaxation.",
            "sad": "Uplifting and motivational music can help improve mood and boost spirits.",
            "fear": "Confident and empowering music can help build courage and reduce anxiety.",
            "happy": "Relaxing music can help maintain your good mood without overstimulation.",
            "neutral": "Popular music can help enhance your current balanced emotional state.",
            "disgust": "Positive and feel-good music can help shift focus to more pleasant thoughts.",
            "surprise": "Familiar music can help ground you and provide emotional stability."
        }
        
        return explanations.get(emotion.lower(), "Music therapy can help balance your emotional state.")
