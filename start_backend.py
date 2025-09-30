#!/usr/bin/env python3
"""
Startup script for MoodTune AI FastAPI backend
"""
import uvicorn
import sys
import os

if __name__ == "__main__":
    print("🎵 Starting MoodTune AI Backend Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔄 Make sure your Next.js frontend is running on http://localhost:3000")
    print("-" * 60)
    
    try:
        uvicorn.run(
            "api:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)
