"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { photos } from "@/lib/content";

const rest = [
  { x: -54, y: 10, rotate: -9 },
  { x: 6, y: -6, rotate: 3 },
  { x: 60, y: 14, rotate: 11 },
];
const fanned = [
  { x: -84, y: 4, rotate: -14 },
  { x: 6, y: -14, rotate: 2 },
  { x: 92, y: 8, rotate: 16 },
];

// In the tall desktop tile the photos cascade downwards instead of fanning sideways.
const restDown = [
  { x: -14, y: -46, rotate: -7 },
  { x: 12, y: 2, rotate: 4 },
  { x: -6, y: 52, rotate: -3 },
];
const fannedDown = [
  { x: -26, y: -58, rotate: -11 },
  { x: 18, y: 2, rotate: 6 },
  { x: -10, y: 64, rotate: -6 },
];

export function PhotoStack({ cascade = false }: { cascade?: boolean }) {
  const [order, setOrder] = React.useState([0, 1, 2]);
  const [hover, setHover] = React.useState(false);
  const reduce = useReducedMotion();

  const raise = (i: number) => setOrder((o) => [...o.filter((x) => x !== i), i]);

  return (
    <div
      className="relative h-[230px] w-[300px] select-none"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      aria-label="Photos"
      role="group"
    >
      {photos.map((p, i) => {
        const pose = (hover && !reduce ? (cascade ? fannedDown : fanned) : cascade ? restDown : rest)[i];
        return (
          <motion.figure
            key={p.src}
            drag
            dragSnapToOrigin
            dragElastic={0.6}
            dragTransition={{ bounceStiffness: 380, bounceDamping: 22 }}
            onPointerDown={() => raise(i)}
            animate={pose}
            whileHover={{ scale: 1.04 }}
            whileDrag={{ scale: 1.08, rotate: 0, cursor: "grabbing" }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{ zIndex: order.indexOf(i) + 1 }}
            data-sound
            className="absolute top-2 left-[78px] w-[144px] cursor-grab rounded-[3px] bg-white p-2 pb-7 shadow-[0_1px_2px_rgb(0_0_0/0.12),0_12px_28px_-8px_rgb(0_0_0/0.35)] ring-1 ring-black/5"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1px] bg-neutral-200">
              <Image src={p.src} alt={p.alt} fill sizes="144px" draggable={false} className="object-cover" priority={i === 1} />
            </div>
            <figcaption className="absolute right-2 bottom-1.5 left-2 truncate text-center font-mono text-[11px] text-neutral-600">
              {p.caption}
            </figcaption>
          </motion.figure>
        );
      })}
    </div>
  );
}
