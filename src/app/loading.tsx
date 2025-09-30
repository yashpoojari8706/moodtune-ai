"use client";

import dynamic from "next/dynamic";

const MusicLoader = dynamic(() => import("@/components/MusicLoader"), { 
  ssr: false 
});

export default function Loading() {
  return (
    <MusicLoader />
  );
}
