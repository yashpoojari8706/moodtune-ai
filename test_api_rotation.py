"""
Test script to verify API key rotation and song display functionality
"""
import requests
import json
import time

def test_api_key_rotation():
    print("🔄 Testing API Key Rotation and Song Display")
    print("=" * 60)
    
    emotions_to_test = ["angry", "sad", "happy", "fear"]
    
    for emotion in emotions_to_test:
        print(f"\n📊 Testing emotion: {emotion.upper()}")
        print("⏳ Calling Gemini API with rotation...")
        
        try:
            response = requests.get(f"http://localhost:8000/songs/{emotion}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"💡 Explanation: {data['explanation']}")
                print("🎶 Songs with Artist & Link Info:")
                
                if data['songs']:
                    for i, song in enumerate(data['songs'], 1):
                        print(f"   {i}. Title: {song.get('song_title', 'N/A')}")
                        print(f"      Artist: {song.get('artist', 'N/A')}")
                        print(f"      Full Name: {song.get('song_name', 'N/A')}")
                        print(f"      🔗 Link: {song.get('link', 'N/A')}")
                        print()
                else:
                    print("   ❌ No songs returned")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Request Error: {e}")
        
        # Small delay between requests
        time.sleep(1)

def test_full_pipeline():
    print("\n" + "=" * 60)
    print("🔄 Testing Full Pipeline (Emotion → Playlist)")
    print("=" * 60)
    
    # Test the analyze endpoint (mock)
    print("\n1. Testing emotion analysis...")
    try:
        # This would normally be audio, but we'll test with text
        response = requests.post("http://localhost:8000/predict/", 
                               files={'audio_file': ('test.wav', b'fake_audio_data', 'audio/wav')})
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Detected emotion: {data.get('predicted_emotion', 'N/A')}")
            
            if 'neutralizing_songs' in data:
                print(f"✅ Got {len(data['neutralizing_songs'])} neutralizing songs")
                for i, song in enumerate(data['neutralizing_songs'][:2], 1):
                    print(f"   {i}. {song.get('song_name', 'N/A')} - {song.get('link', 'N/A')}")
            else:
                print("⚠️ No neutralizing songs in response")
        else:
            print(f"❌ Analyze endpoint error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Pipeline test error: {e}")

if __name__ == "__main__":
    print("🚀 Starting API Key Rotation & Song Display Tests")
    
    # Test individual song endpoints
    test_api_key_rotation()
    
    # Test full pipeline
    test_full_pipeline()
    
    print("\n" + "=" * 60)
    print("✨ Test completed!")
    print("🔧 Check backend logs for API key rotation messages")
    print("🎵 Verify that songs have proper artist/title separation")
    print("🔗 Verify that YouTube links are clickable in the UI")
