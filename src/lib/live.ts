import { profile } from "./content";

export type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type Contributions = { total: number; days: Day[]; streak: number; longest: number };

export async function getContributions(): Promise<Contributions | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${profile.github}?y=last`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { total: { lastYear: number }; contributions: Day[] };
    const days = json.contributions;

    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) streak++;
      else if (i === days.length - 1) continue; // today may not have a commit yet
      else break;
    }
    let longest = 0;
    let run = 0;
    for (const d of days) {
      run = d.count > 0 ? run + 1 : 0;
      longest = Math.max(longest, run);
    }
    return { total: json.total.lastYear, days, streak, longest };
  } catch {
    return null;
  }
}

const WEATHER: Record<number, string> = {
  0: "clear", 1: "mostly clear", 2: "partly cloudy", 3: "overcast",
  45: "fog", 48: "fog", 51: "drizzle", 53: "drizzle", 55: "drizzle",
  61: "light rain", 63: "rain", 65: "heavy rain", 80: "showers", 81: "showers", 82: "storms",
  95: "thunderstorm", 96: "thunderstorm", 99: "thunderstorm",
};

export type Weather = { temp: number; label: string; isDay: boolean };

export async function getWeather(): Promise<Weather | null> {
  try {
    const { lat, lon } = profile.coords;
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=Asia%2FKolkata`,
      { next: { revalidate: 900 }, signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      current: { temperature_2m: number; weather_code: number; is_day: number };
    };
    return {
      temp: Math.round(json.current.temperature_2m),
      label: WEATHER[json.current.weather_code] ?? "—",
      isDay: json.current.is_day === 1,
    };
  } catch {
    return null;
  }
}
