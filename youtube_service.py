"""
Gemini API service for finding neutralizing songs based on emotions
"""
import json
import re
import google.generativeai as genai
from config import GEMINI_API_KEY, EMOTION_NEUTRALIZATION_PROMPTS

class GeminiMusicService:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def get_neutralizing_songs(self, emotion: str, max_results: int = 5):
        """
        Get songs that can help neutralize the given emotion using Gemini AI
        
        Args:
            emotion (str): The detected emotion
            max_results (int): Maximum number of songs to return
            
        Returns:
            list: List of dictionaries containing song name and YouTube link
        """
        try:
            # Get the appropriate music description for the emotion
            music_description = EMOTION_NEUTRALIZATION_PROMPTS.get(emotion.lower(), "relaxing music")
            
            # Create a detailed prompt for Gemini
            prompt = f"""
            I need exactly {max_results} song recommendations for someone feeling {emotion}. 
            The songs should be {music_description}.
            
            Please provide the response in this exact JSON format:
            {{
                "songs": [
                    {{
                        "song_name": "Song Title - Artist Name",
                        "link": "https://www.youtube.com/watch?v=VIDEO_ID"
                    }}
                ]
            }}
            
            Requirements:
            - Provide real, popular songs that exist on YouTube
            - Include both song title and artist name
            - Provide actual YouTube links (you can use common/popular video IDs)
            - Focus on well-known songs that would help with {emotion} emotion
            - Make sure all songs are appropriate for emotional regulation
            """
            
            response = self.model.generate_content(prompt)
            
            # Parse the response
            response_text = response.text.strip()
            
            # Extract JSON from the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                data = json.loads(json_str)
                return data.get('songs', [])
            else:
                # Fallback: parse manually if JSON format is not perfect
                return self._parse_fallback_response(response_text, max_results)
                
        except Exception as e:
            print(f"Error getting songs from Gemini: {e}")
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
        """Fallback songs if Gemini API fails"""
        fallback_songs = {
            "angry": [
                {"song_name": "Weightless - Marconi Union", "link": "https://www.youtube.com/watch?v=UfcAVejslrU"},
                {"song_name": "Clair de Lune - Claude Debussy", "link": "https://www.youtube.com/watch?v=CvFH_6DNRCY"},
                {"song_name": "Aqueous Transmission - Incubus", "link": "https://www.youtube.com/watch?v=eQK7KSTQfaw"},
                {"song_name": "Mad World - Gary Jules", "link": "https://www.youtube.com/watch?v=4N3N1MlvVc4"},
                {"song_name": "The Sound of Silence - Simon & Garfunkel", "link": "https://www.youtube.com/watch?v=4fWyzwo1xg0"}
            ],
            "sad": [
                {"song_name": "Happy - Pharrell Williams", "link": "https://www.youtube.com/watch?v=ZbZSe6N_BXs"},
                {"song_name": "Good Vibrations - The Beach Boys", "link": "https://www.youtube.com/watch?v=Eab_beh07HU"},
                {"song_name": "Don't Stop Me Now - Queen", "link": "https://www.youtube.com/watch?v=HgzGwKwLmgM"},
                {"song_name": "Walking on Sunshine - Katrina and the Waves", "link": "https://www.youtube.com/watch?v=iPUmE-tne5U"},
                {"song_name": "I Can See Clearly Now - Johnny Nash", "link": "https://www.youtube.com/watch?v=MrHxhQPOO2c"}
            ],
            "fear": [
                {"song_name": "Stronger - Kelly Clarkson", "link": "https://www.youtube.com/watch?v=Xn676-fLq7I"},
                {"song_name": "Fight Song - Rachel Platten", "link": "https://www.youtube.com/watch?v=xo1VInw-SKc"},
                {"song_name": "Roar - Katy Perry", "link": "https://www.youtube.com/watch?v=CevxZvSJLk8"},
                {"song_name": "Brave - Sara Bareilles", "link": "https://www.youtube.com/watch?v=QUQsqBqxoR4"},
                {"song_name": "Confident - Demi Lovato", "link": "https://www.youtube.com/watch?v=cwjjSmwc5ME"}
            ]
        }
        
        default_songs = [
            {"song_name": "Relaxing Piano Music", "link": "https://www.youtube.com/watch?v=1ZYbU82GVz4"},
            {"song_name": "Peaceful Nature Sounds", "link": "https://www.youtube.com/watch?v=eKFTSSKCzWA"},
            {"song_name": "Meditation Music", "link": "https://www.youtube.com/watch?v=lFcSrYw-ARY"},
            {"song_name": "Calm Instrumental", "link": "https://www.youtube.com/watch?v=M4QCh-yIPzA"},
            {"song_name": "Soothing Sounds", "link": "https://www.youtube.com/watch?v=nDq6TstdEi8"}
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
