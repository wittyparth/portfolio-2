export const MODES = [15, 30, 60] as const;
export type Mode = (typeof MODES)[number];
export const WORD_SETS = ["words", "code"] as const;
export type WordSet = (typeof WORD_SETS)[number];

export const isMode = (v: unknown): v is Mode => MODES.includes(v as Mode);
export const isWordSet = (v: unknown): v is WordSet => WORD_SETS.includes(v as WordSet);

const WORDS = `the be of and a to in he have it that for they with as not on she at by this we you do but from or which one would all will there say who make when can more if no man out other so what time up go about than into could state only new year some take come these know see use get like then first any work now may such give over think most even find day also after way many must look before great back through long where much should well people down own just because good each those feel seem how high too place little world very still nation hand old life tell write become here show house both between need mean call develop under last right move thing general school never same another begin while number part turn real leave might want point form off child few small since against ask late home interest large person end open public follow during present without again hold govern around possible head consider word program problem however lead system set order eye plan run keep face fact group play stand increase early course change help line city put close case force meet once water upon war build hear light unite live every country bring center let side try provide continue name certain power pay result question study woman member until far night always service away report something company week church toward start social room figure nature though young less enough almost read include president nothing yet better big boy cost business value second why clear expect family complete act sense mind experience art next near direct car law industry important girl god several matter usual rather per often kind among white reason action return foot care simple within love human along appear doctor believe speak active student month drive concern best door hope example inform body ever least probable understand reach effect different idea whole control condition field pass fall note special talk particular today measure walk teach low hour type carry rate remain full street easy although record sit determine level local sure receive thus moment spirit train college religion perhaps music grow free cause serve age book board recent sound office cut step class true history position above strong friend necessary add court deal tax support party whether either land material happen education death agree arm mother across quite anything town past view society manage answer break organize half fire lose money stop actual already effort wait department able political learn voice air together shall cover common subject draw short wife treat limit road letter color behind produce send term total university rise century success minute remember purpose test fight watch situation south ago difference stage father table rest bear entire market prepare explain offer plant charge ground west picture hard front lie modern dark surface rule regard dance peace observe future wall farm claim firm operation further pressure property morning amount top outside piece sometimes beauty trade fear demand wonder list accept judge paint mile soon responsible allow secretary heart union slow island enter drink story experiment stay paper space apply decide share desire spend sign therefore various visit supply officer doubt private immediate finish contain`.split(/\s+/);

const CODE = `function return const let async await promise import export default class interface type extends implements null undefined boolean string number array object map filter reduce render props state hook effect context reducer component server client route handler request response header token cookie session cache query mutation schema index table column join select insert update delete where limit offset transaction commit rollback branch merge rebase deploy build bundle compile lint format test mock assert fixture docker container image volume cluster node pod service ingress queue worker retry timeout backoff stream buffer socket event emitter listener callback closure scope prototype generator iterator yield decorator python pandas numpy tensor gradient model train inference prompt token embedding vector retrieval agent tool schema eval latency throughput batch epoch loss optimizer layer attention transformer context window chunk rerank pipeline graph node edge state memory planner executor json yaml regex parse serialize validate refactor debug profile benchmark`.split(/\s+/);

export const wordLists: Record<WordSet, string[]> = { words: WORDS, code: CODE };

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Enough words that even 250 WPM for 60s never runs off the end.
export function generateText(seed: number, set: WordSet, count = 320) {
  const list = wordLists[set];
  const rand = mulberry32(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    let w = list[Math.floor(rand() * list.length)];
    if (w === out[out.length - 1]) w = list[(list.indexOf(w) + 1) % list.length];
    out.push(w);
  }
  return out.join(" ");
}

export const wpmFrom = (chars: number, ms: number) => (ms <= 0 ? 0 : chars / 5 / (ms / 60000));
export const accuracyFrom = (correct: number, incorrect: number) =>
  correct + incorrect === 0 ? 0 : correct / (correct + incorrect);

export function consistency(samples: number[]) {
  const xs = samples.filter((x) => Number.isFinite(x));
  if (xs.length < 2) return 0;
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  if (mean === 0) return 0;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length);
  return Math.max(0, Math.min(100, 100 * (1 - sd / mean)));
}

export const LIMITS = {
  maxWpm: 250,
  minAccuracy: 0.75,
  elapsedToleranceMs: 1500,
  maxKeystrokesPerSecond: 25,
  maxSample: 400,
  nameMin: 1,
  nameMax: 20,
} as const;

export const leaderboardKey =(mode: Mode, set: WordSet) =>
  set === "words" ? `typing:lb:${mode}` : `typing:lb:${mode}:${set}`;

export type LeaderboardEntry = {
  rank: number;
  name: string;
  wpm: number;
  accuracy: number;
  at: number;
};

export type LeaderboardResponse = { entries: LeaderboardEntry[]; total: number };

export type SubmitResponse =
  | { ok: true; wpm: number; accuracy: number; rank: number; total: number; improved: boolean; best: number }
  | { ok: false; error: string; message: string };
