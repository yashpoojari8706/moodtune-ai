import { NextRequest, NextResponse } from 'next/server';
import { Track, Playlist } from '@/components/PlaylistDisplay';

// Mock music database - in a real app, you'd use Spotify API, Last.fm, etc.
const mockTracks: Omit<Track, 'vibe_note' | 'mood_match'>[] = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:20",
    preview_url: "https://example.com/preview1.mp3",
    external_url: "https://open.spotify.com/track/example1"
  },
  {
    id: "2",
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    duration: "2:58",
    preview_url: "https://example.com/preview2.mp3",
    external_url: "https://open.spotify.com/track/example2"
  },
  {
    id: "3",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:23",
    preview_url: "https://example.com/preview3.mp3",
    external_url: "https://open.spotify.com/track/example3"
  },
  {
    id: "4",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: "2:54",
    preview_url: "https://example.com/preview4.mp3",
    external_url: "https://open.spotify.com/track/example4"
  },
  {
    id: "5",
    title: "drivers license",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    duration: "4:02",
    preview_url: "https://example.com/preview5.mp3",
    external_url: "https://open.spotify.com/track/example5"
  },
  {
    id: "6",
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    album: "F*CK LOVE 3: OVER YOU",
    duration: "2:21",
    preview_url: "https://example.com/preview6.mp3",
    external_url: "https://open.spotify.com/track/example6"
  },
  {
    id: "7",
    title: "Heat Waves",
    artist: "Glass Animals",
    album: "Dreamland",
    duration: "3:58",
    preview_url: "https://example.com/preview7.mp3",
    external_url: "https://open.spotify.com/track/example7"
  },
  {
    id: "8",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    duration: "2:47",
    preview_url: "https://example.com/preview8.mp3",
    external_url: "https://open.spotify.com/track/example8"
  },
  {
    id: "9",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    album: "Midnights",
    duration: "3:20",
    preview_url: "https://example.com/preview9.mp3",
    external_url: "https://open.spotify.com/track/example9"
  },
  {
    id: "10",
    title: "Flowers",
    artist: "Miley Cyrus",
    album: "Endless Summer Vacation",
    duration: "3:20",
    preview_url: "https://example.com/preview10.mp3",
    external_url: "https://open.spotify.com/track/example10"
  }
];

const generateVibeNote = (track: any, mood: string, energy: number, valence: number): string => {
  const vibeNotes = {
    euphoric: [
      `This track's explosive energy matches your sky-high vibes perfectly! `,
      `Pure sonic adrenaline for your euphoric state - let's gooo! `,
      `This beat hits different when you're feeling on top of the world! `
    ],
    upbeat: [
      `This groove's got the perfect bounce for your positive energy! `,
      `Uplifting vibes that'll keep your good mood rolling! `,
      `This track's sunny disposition matches yours perfectly! `
    ],
    content: [
      `Smooth and satisfying - just like your current peaceful state! `,
      `This mellow vibe complements your contentment beautifully! `,
      `Perfect soundtrack for your zen moment! `
    ],
    peaceful: [
      `Gentle waves of sound for your tranquil mindset! `,
      `This calming melody wraps around your peaceful energy! `,
      `Serene vibes that honor your inner calm! `
    ],
    melancholic: [
      `This track understands your feels and gives them space to breathe! `,
      `Sometimes we need music that sits with us in the quiet moments! `,
      `Beautiful melancholy that validates your emotional depth! `
    ],
    contemplative: [
      `Perfect for those deep-thinking moments you're having! `,
      `This introspective vibe matches your reflective mood! `,
      `Music for when your mind is wandering through thoughts! `
    ],
    frustrated: [
      `This beat's got edge to match your restless energy! `,
      `Channel that frustration into this driving rhythm! `,
      `Sometimes you need music with a little bite - here it is! `
    ],
    angry: [
      `This track's got the fire to match your intensity! `,
      `Raw energy for when you need to let it all out! `,
      `This beat's got your back on that rage - let it rip! `
    ]
  };

  const moodNotes = vibeNotes[mood as keyof typeof vibeNotes] || vibeNotes.contemplative;
  return moodNotes[Math.floor(Math.random() * moodNotes.length)];
};

const calculateMoodMatch = (track: any, mood: string, energy: number, valence: number): number => {
  // Mock algorithm to calculate how well a track matches the detected mood
  let baseScore = 60;
  
  // Adjust based on track characteristics (in a real app, you'd have audio features)
  const trackEnergy = Math.random() * 100;
  const trackValence = Math.random() * 100;
  
  const energyDiff = Math.abs(energy - trackEnergy);
  const valenceDiff = Math.abs(valence - trackValence);
  
  const energyScore = Math.max(0, 100 - energyDiff);
  const valenceScore = Math.max(0, 100 - valenceDiff);
  
  const finalScore = Math.round((baseScore + energyScore + valenceScore) / 3);
  
  // Add some randomness but keep it realistic
  return Math.max(45, Math.min(98, finalScore + (Math.random() * 20 - 10)));
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mood, energy = 50, valence = 50, intensity = 50, surprise = false } = body;

    if (!mood) {
      return NextResponse.json(
        { error: "Mood is required" },
        { status: 400 }
      );
    }

    // Select 5 random tracks (in a real app, you'd use sophisticated matching)
    const shuffled = [...mockTracks].sort(() => 0.5 - Math.random());
    const selectedTracks = shuffled.slice(0, 5);

    // Generate vibe notes and mood matches for each track
    const tracksWithVibes: Track[] = selectedTracks.map(track => ({
      ...track,
      vibe_note: generateVibeNote(track, mood, energy, valence),
      mood_match: calculateMoodMatch(track, mood, energy, valence)
    }));

    // Sort by mood match (best matches first)
    tracksWithVibes.sort((a, b) => b.mood_match - a.mood_match);

    const playlist: Playlist = {
      id: `playlist_${Date.now()}`,
      name: surprise ? "🎲 Surprise Remix Vibes" : `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes`,
      description: surprise 
        ? "A curated surprise mix to shake up your musical world!"
        : `A personalized playlist crafted for your ${mood} mood`,
      mood_detected: mood,
      tracks: tracksWithVibes,
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      playlist
    });

  } catch (error) {
    console.error("Error generating playlist:", error);
    return NextResponse.json(
      { error: "Failed to generate playlist" },
      { status: 500 }
    );
  }
}
