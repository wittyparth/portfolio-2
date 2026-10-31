"use client";

import * as React from "react";
import { Volume2 } from "@/components/animate-ui/icons/volume-2";
import { AnimateIcon } from "@animate-ui/react/icons";
import { profile } from "@/lib/content";
import { Tip } from "./tip";

// Plays the recorded clip when profile.nameAudio is set; until then, a browser voice stands in.
export function NameAudio() {
  const [playing, setPlaying] = React.useState(false);
  const audio = React.useRef<HTMLAudioElement | null>(null);

  const speak = () => {
    if (playing) return;
    if (profile.nameAudio) {
      audio.current ??= new Audio(profile.nameAudio);
      const a = audio.current;
      a.currentTime = 0;
      a.onended = () => setPlaying(false);
      a.onerror = () => setPlaying(false);
      setPlaying(true);
      a.play().catch(() => setPlaying(false));
      return;
    }
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(profile.name);
    const voices = window.speechSynthesis.getVoices();
    u.voice = voices.find((v) => v.lang === "en-IN") ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
    u.rate = 0.85;
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <Tip label={`Say it like “${profile.pronunciation}”`}>
      <AnimateIcon animate={playing} loop={playing} asChild>
        <button
          type="button"
          onClick={speak}
          aria-label={`Hear how to pronounce ${profile.name}`}
          className="inline-grid size-8 place-items-center rounded-full align-middle text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[playing=true]:text-foreground"
          data-playing={playing}
        >
          <Volume2 size={18} />
        </button>
      </AnimateIcon>
    </Tip>
  );
}
