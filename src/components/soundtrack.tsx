"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { siSpotify } from "simple-icons";
import { soundtrack } from "@/lib/content";
import { cn } from "@/lib/utils";

type Track = (typeof soundtrack.tracks)[number];
const seconds = (len: string) => len.split(":").reduce((m, s) => m * 60 + Number(s), 0);
const spotify = (t: Track) => `https://open.spotify.com/search/${encodeURIComponent(`${t.title} ${t.artist}`)}`;

function SpotifyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="#1DB954">
      <path d={siSpotify.path} />
    </svg>
  );
}

/** Equalizer bars for the track that's "playing". */
function Bars({ playing }: { playing: boolean }) {
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0.9, 0.5, 0.75].map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] origin-bottom rounded-[1px] bg-[#1DB954]", playing && "animate-[eq_0.9s_ease-in-out_infinite]")}
          style={{ height: `${h * 100}%`, animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

/** A record player for the songs on repeat. The record spins while "playing"; listening happens on Spotify. */
export function Soundtrack() {
  const tracks = soundtrack.tracks;
  // Position in the queue: which song, and how far into it.
  const [{ index, elapsed }, setPos] = React.useState({ index: 0, elapsed: 0 });
  const [playing, setPlaying] = React.useState(false);
  const reduce = useReducedMotion();
  const track = tracks[index];
  const total = seconds(track.length);

  const go = (i: number) => setPos({ index: (i + tracks.length) % tracks.length, elapsed: 0 });

  // The progress bar runs at real speed while playing, then moves on to the next song.
  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPos((p) =>
        p.elapsed + 1 < seconds(tracks[p.index].length)
          ? { ...p, elapsed: p.elapsed + 1 }
          : { index: (p.index + 1) % tracks.length, elapsed: 0 },
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, tracks]);

  const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const label = `hsl(${track.hue} 70% 55%)`;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-200 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.6)]">
      <div className="grid gap-6 p-5 sm:grid-cols-[11rem_1fr] sm:items-center">
        {/* The turntable. */}
        <div className="relative mx-auto size-44">
          <motion.div
            className="absolute inset-0 rounded-full shadow-[0_10px_30px_-8px_rgb(0_0_0/0.9)]"
            style={{
              background: `repeating-radial-gradient(circle at center, #111 0 2px, #1b1b1b 2px 3px), #111`,
            }}
            animate={playing && !reduce ? { rotate: 360 } : { rotate: 0 }}
            transition={playing && !reduce ? { duration: 1.8, ease: "linear", repeat: Infinity } : { duration: 0.6 }}
          >
            {/* Light catching the grooves. */}
            <span aria-hidden className="absolute inset-0 rounded-full bg-[conic-gradient(from_30deg,transparent_0deg,rgb(255_255_255/0.08)_40deg,transparent_80deg,transparent_180deg,rgb(255_255_255/0.06)_220deg,transparent_260deg)]" />
            <span
              aria-hidden
              className="absolute inset-[34%] grid place-items-center rounded-full transition-colors duration-700"
              style={{ background: `radial-gradient(circle, ${label}, hsl(${track.hue} 60% 35%))` }}
            >
              <span className="size-2 rounded-full bg-neutral-950" />
            </span>
          </motion.div>
          {/* Tonearm: swings onto the record while playing. */}
          <motion.span
            aria-hidden
            className="absolute -top-1 -right-2 h-24 w-1.5 origin-top rounded-full bg-gradient-to-b from-neutral-300 to-neutral-500"
            animate={{ rotate: playing ? 24 : 4 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            <span className="absolute -bottom-1 left-1/2 h-3 w-2.5 -translate-x-1/2 rounded-[2px] bg-neutral-400" />
          </motion.span>
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] text-neutral-500 uppercase">
            <SpotifyMark className="size-3.5" />
            On repeat
          </p>
          <p className="mt-3 truncate text-xl font-semibold tracking-tight text-white">{track.title}</p>
          <p className="truncate text-sm text-neutral-400">{track.artist}</p>

          <div className="mt-4">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#1DB954] transition-[width] duration-1000 ease-linear" style={{ width: `${(elapsed / total) * 100}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-neutral-500 tabular-nums">
              <span>{clock(elapsed)}</span>
              <span>{track.length}</span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button type="button" aria-label="Previous song" onClick={() => go(index - 1)} className="grid size-9 place-items-center rounded-full text-neutral-400 transition-colors hover:text-white">
              <SkipBack className="size-4" fill="currentColor" />
            </button>
            <button
              type="button"
              aria-label={playing ? "Stop the record" : "Spin the record"}
              aria-pressed={playing}
              onClick={() => setPlaying((p) => !p)}
              className="grid size-11 place-items-center rounded-full bg-white text-neutral-950 transition-transform hover:scale-105 active:scale-95"
            >
              {playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4 translate-x-px" fill="currentColor" />}
            </button>
            <button type="button" aria-label="Next song" onClick={() => go(index + 1)} className="grid size-9 place-items-center rounded-full text-neutral-400 transition-colors hover:text-white">
              <SkipForward className="size-4" fill="currentColor" />
            </button>
            <a
              href={spotify(track)}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-[#1DB954] hover:text-white"
            >
              Listen on Spotify <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>

      <ol className="border-t border-white/10 px-2 py-2">
        {tracks.map((t, i) => {
          const current = i === index;
          return (
            <li key={t.title}>
              <button
                type="button"
                onClick={() => {
                  go(i);
                  setPlaying(true);
                }}
                aria-current={current}
                className={cn(
                  "grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5",
                  current && "bg-white/[0.06]",
                )}
              >
                <span className="font-mono text-xs text-neutral-500 tabular-nums">{current ? <Bars playing={playing} /> : i + 1}</span>
                <span className="min-w-0">
                  <span className={cn("block truncate text-sm", current ? "text-[#1DB954]" : "text-neutral-200")}>{t.title}</span>
                  <span className="block truncate text-xs text-neutral-500">{t.artist}</span>
                </span>
                <span className="font-mono text-xs text-neutral-500 tabular-nums">{t.length}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {soundtrack.spotifyPlaylist && (
        <iframe
          title="Spotify playlist"
          src={`https://open.spotify.com/embed/playlist/${soundtrack.spotifyPlaylist}?theme=0`}
          className="block h-[152px] w-full border-t border-white/10"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}
    </div>
  );
}
