"use client";

import dynamic from "next/dynamic";

// Dynamically import the main app component to avoid SSR issues
const MoodTuneApp = dynamic(() => import("@/components/MoodTuneApp"), { 
  ssr: false
});

export default function Home() {
  return <MoodTuneApp />;
}
