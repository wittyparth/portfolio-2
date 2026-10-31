import type { Weather } from "./live";

export type Presence = {
  state: "online" | "away" | "asleep";
  line: string;
};

const rainy = (w: Weather | null) => !!w && /rain|drizzle|shower|storm|thunder/.test(w.label);

// Bengaluru-local hour (0–23) and weekday (0 = Sunday).
export function presenceFor(hour: number, day: number, weather: Weather | null): Presence {
  const weekend = day === 0 || day === 6;

  if (hour < 6) return { state: "asleep", line: "Probably asleep. I'll reply in the morning." };
  if (hour < 9) return { state: "away", line: rainy(weather) ? "Rainy morning in Bengaluru. Coffee first." : "Early morning. Coffee first, code second." };
  if (weekend) {
    if (hour < 13) return { state: "away", line: "Weekend. Probably out, or tinkering with a side project." };
    if (hour < 19) return { state: "online", line: rainy(weather) ? "Rainy weekend, so it's side projects and chai." : "Weekend side-project hours." };
  } else {
    if (hour === 13) return { state: "away", line: "Out for lunch, back soon." };
    if (hour < 19) return { state: "online", line: "At work, building agents at Lyzr." };
  }
  if (hour < 23) return { state: "online", line: rainy(weather) ? "It's raining in Bengaluru. Chai and side projects." : "Evening. Side projects and reading." };
  return { state: "away", line: "Winding down for the night." };
}

export const presenceDot: Record<Presence["state"], string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  asleep: "bg-neutral-400",
};
