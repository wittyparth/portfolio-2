// Shared guestbook rules: used by the form (live feedback) and the API (enforcement).

export const NAME_MAX = 40;
export const MESSAGE_MAX = 280;
export const PAGE_SIZE = 20;
export const MIN_FILL_MS = 2500;

export type GuestbookEntry = { id: string; name: string; message: string; createdAt: number };

export type GuestbookErrorCode =
  | "invalid_json"
  | "too_large"
  | "unsupported_media"
  | "name_required"
  | "name_too_long"
  | "message_required"
  | "message_too_long"
  | "no_content"
  | "links_not_allowed"
  | "not_allowed"
  | "too_fast"
  | "token_invalid"
  | "rate_limited"
  | "duplicate"
  | "server_error";

export type GuestbookError = {
  code: GuestbookErrorCode;
  message: string;
  field?: "name" | "message";
  retryAfter?: number;
};

const INVISIBLE =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u200B\u200E\u200F\u2028\u2029\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF]/g;
const MEANINGFUL = /[\p{L}\p{N}\p{Extended_Pictographic}]/u;
const URL_LIKE =
  /(https?:\/\/|www\.|\b[a-z0-9-]{2,}\.(com|net|org|io|dev|xyz|ru|in|co|app|ly|me|info|biz|site|online|link|gg|ai|to|tk|top|shop|click)\b)/i;

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

export function graphemeLength(text: string) {
  if (!segmenter) return [...text].length;
  return [...segmenter.segment(text)].length;
}

export function normalizeName(raw: string) {
  return raw.normalize("NFC").replace(INVISIBLE, "").replace(/\s+/g, " ").trim();
}

export function normalizeMessage(raw: string) {
  return raw
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .replace(INVISIBLE, "")
    .split("\n")
    .map((line) => line.replace(/ {2,}/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Structural validation only; content policy (profanity) lives on the server. */
export function validateFields(name: string, message: string): GuestbookError | null {
  if (!name) return { code: "name_required", field: "name", message: "Add a name, even a nickname works." };
  if (graphemeLength(name) > NAME_MAX)
    return { code: "name_too_long", field: "name", message: `Keep the name under ${NAME_MAX} characters.` };
  if (!MEANINGFUL.test(name)) return { code: "name_required", field: "name", message: "That name needs at least one letter or number." };
  if (URL_LIKE.test(name)) return { code: "links_not_allowed", field: "name", message: "Names can't contain links." };

  if (!message) return { code: "message_required", field: "message", message: "Write a little something first." };
  if (graphemeLength(message) > MESSAGE_MAX)
    return { code: "message_too_long", field: "message", message: `That's a bit long, keep it under ${MESSAGE_MAX} characters.` };
  if (!MEANINGFUL.test(message))
    return { code: "no_content", field: "message", message: "Say a few words; punctuation alone won't do." };
  if (URL_LIKE.test(message))
    return { code: "links_not_allowed", field: "message", message: "Links aren't allowed here, just leave a note." };
  return null;
}

export function initials(name: string) {
  const words = name.split(" ").filter((w) => /^\p{L}/u.test(w));
  if (words.length === 0) return [...name][0]?.toUpperCase() ?? "?";
  const first = [...words[0]][0];
  const last = words.length > 1 ? [...words[words.length - 1]][0] : "";
  return (first + last).toUpperCase();
}
