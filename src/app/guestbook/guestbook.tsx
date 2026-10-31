"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number";
import { Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  MESSAGE_MAX, NAME_MAX, graphemeLength, initials, normalizeMessage, normalizeName, validateFields,
  type GuestbookEntry, type GuestbookError,
} from "@/lib/guestbook";

const NAME_KEY = "guestbook-name";
const NAME_EVENT = "guestbook-name-change";

function subscribeName(cb: () => void) {
  window.addEventListener(NAME_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(NAME_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

function useNow(interval: number) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function relative(ts: number, now: number) {
  const s = Math.round((ts - now) / 1000);
  const abs = Math.abs(s);
  if (abs < 45) return "just now";
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(s / 86400), "day");
  if (abs < 86400 * 365) return rtf.format(Math.round(s / (86400 * 30)), "month");
  return rtf.format(Math.round(s / (86400 * 365)), "year");
}

// A tiny, stable tilt per note so the wall feels pinned by hand.
function tilt(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 7) - 3) * 0.25;
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; error: GuestbookError };

export function Guestbook({
  initialEntries, initialCursor, initialTotal, token, ephemeral,
}: {
  initialEntries: GuestbookEntry[];
  initialCursor: string | null;
  initialTotal: number;
  token: string;
  ephemeral: boolean;
}) {
  const [entries, setEntries] = React.useState(initialEntries);
  const [cursor, setCursor] = React.useState(initialCursor);
  const [total, setTotal] = React.useState(initialTotal);
  const [mine, setMine] = React.useState<Set<string>>(() => new Set());
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [moreError, setMoreError] = React.useState(false);

  const savedName = React.useSyncExternalStore(subscribeName, () => localStorage.getItem(NAME_KEY) ?? "", () => "");
  const online = React.useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const [nameDraft, setNameDraft] = React.useState<string | null>(null);
  const name = nameDraft ?? savedName;
  const [message, setMessage] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });
  const [retryUntil, setRetryUntil] = React.useState(0);

  const now = useNow(1000);
  const reduce = useReducedMotion();
  const formRef = React.useRef<HTMLFormElement>(null);
  const messageRef = React.useRef<HTMLTextAreaElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);

  const waitSeconds = Math.max(0, Math.ceil((retryUntil - now) / 1000));
  const rateLimited = waitSeconds > 0;
  const messageLength = graphemeLength(normalizeMessage(message));
  const nameLength = graphemeLength(normalizeName(name));
  const nearLimit = messageLength > MESSAGE_MAX - 30;
  const overLimit = messageLength > MESSAGE_MAX;
  const fieldError = status.kind === "error" ? status.error.field : undefined;
  const submitting = status.kind === "submitting";
  const disabled = submitting || rateLimited || !online;

  const submit = async () => {
    if (disabled) return;
    const cleanName = normalizeName(name);
    const cleanMessage = normalizeMessage(message);
    const local = validateFields(cleanName, cleanMessage);
    if (local) {
      setStatus({ kind: "error", error: local });
      (local.field === "name" ? nameRef : messageRef).current?.focus();
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, message: cleanMessage, token, company }),
      });
      const data = (await res.json().catch(() => null)) as
        | { entry: GuestbookEntry }
        | { error: GuestbookError }
        | null;

      if (res.ok && data && "entry" in data) {
        setEntries((list) => [data.entry, ...list.filter((e) => e.id !== data.entry.id)]);
        setTotal((t) => t + 1);
        setMine((s) => new Set(s).add(data.entry.id));
        setMessage("");
        localStorage.setItem(NAME_KEY, cleanName);
        window.dispatchEvent(new Event(NAME_EVENT));
        setNameDraft(null);
        setStatus({ kind: "success" });
        return;
      }

      const error: GuestbookError =
        data && "error" in data ? data.error : { code: "server_error", message: "Something went wrong. Try again." };
      if (error.code === "rate_limited" && error.retryAfter) setRetryUntil(Date.now() + error.retryAfter * 1000);
      setStatus({ kind: "error", error });
      if (error.field) (error.field === "name" ? nameRef : messageRef).current?.focus();
    } catch {
      setStatus({
        kind: "error",
        error: { code: "server_error", message: navigator.onLine ? "Couldn't reach the server. Try again." : "You're offline. Your note is still here; send it when you're back." },
      });
    }
  };

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    setMoreError(false);
    try {
      const res = await fetch(`/api/guestbook?cursor=${encodeURIComponent(cursor)}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { entries: GuestbookEntry[]; nextCursor: string | null; total: number };
      setEntries((list) => {
        const seen = new Set(list.map((e) => e.id));
        return [...list, ...data.entries.filter((e) => !seen.has(e.id))];
      });
      setCursor(data.nextCursor);
      setTotal(data.total);
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const clearErrorFor = (field: "name" | "message") => {
    if (status.kind === "error" && (status.error.field === field || !status.error.field)) setStatus({ kind: "idle" });
    if (status.kind === "success") setStatus({ kind: "idle" });
  };

  return (
    <>
      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="mt-10 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(0_0_0/0.18)] sm:p-5"
      >
        <div className="grid gap-3">
          <div>
            <label htmlFor="gb-name" className="mb-1.5 block text-sm text-muted-foreground">Your name</label>
            <Input
              id="gb-name"
              ref={nameRef}
              value={name}
              onChange={(e) => {
                setNameDraft(e.target.value);
                clearErrorFor("name");
              }}
              maxLength={NAME_MAX * 4}
              autoComplete="name"
              placeholder="What should I call you?"
              aria-invalid={fieldError === "name" || nameLength > NAME_MAX}
              aria-describedby={fieldError === "name" ? "gb-status" : undefined}
              className="h-10 bg-background"
            />
          </div>
          <div>
            <label htmlFor="gb-message" className="mb-1.5 block text-sm text-muted-foreground">Your note</label>
            <Textarea
              id="gb-message"
              ref={messageRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                clearErrorFor("message");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void submit();
                }
              }}
              maxLength={MESSAGE_MAX * 4}
              rows={3}
              placeholder="Say hi, share a thought, or tell me what you're building…"
              aria-invalid={fieldError === "message" || overLimit}
              aria-describedby={`gb-count${fieldError === "message" ? " gb-status" : ""}`}
              className="max-h-60 min-h-24 resize-none bg-background text-[15px] leading-relaxed"
            />
          </div>

          {/* Humans never see this; bots fill it in. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="gb-company">Company</label>
            <input
              id="gb-company"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span
            id="gb-count"
            className={cn(
              "font-mono text-xs tabular-nums text-muted-foreground transition-colors",
              nearLimit && "text-amber-600 dark:text-amber-400",
              overLimit && "text-destructive",
            )}
          >
            {messageLength}/{MESSAGE_MAX}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            <kbd className="rounded border border-border px-1 font-mono text-[10px]">⌘</kbd>
            <kbd className="ml-0.5 rounded border border-border px-1 font-mono text-[10px]">↵</kbd> to send
          </span>
          <Button type="submit" disabled={disabled} className="ml-auto h-9 min-w-24 rounded-full px-4">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing
              </>
            ) : rateLimited ? (
              <span className="tabular-nums">
                Wait {Math.floor(waitSeconds / 60)}:{String(waitSeconds % 60).padStart(2, "0")}
              </span>
            ) : (
              "Sign"
            )}
          </Button>
        </div>

        <div id="gb-status" aria-live="polite" className="min-h-0">
          <AnimatePresence initial={false} mode="wait">
            {!online && (
              <motion.p
                key="offline"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"
              >
                <WifiOff className="size-4" /> You&apos;re offline. Your note stays here until you&apos;re back.
              </motion.p>
            )}
            {online && status.kind === "error" && (
              <motion.p
                key={status.error.code + status.error.message}
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 text-sm text-destructive"
              >
                {status.error.message}
                {status.error.code === "token_invalid" && (
                  <button type="button" onClick={() => location.reload()} className="ml-2 underline underline-offset-4">
                    Reload
                  </button>
                )}
              </motion.p>
            )}
            {online && status.kind === "success" && (
              <motion.p
                key="ok"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 text-sm text-emerald-700 dark:text-emerald-400"
              >
                Thanks for signing. Your note is on the wall.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>

      <section aria-labelledby="gb-wall" className="mt-14">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 id="gb-wall" className="text-lg font-medium tracking-tight">The wall</h2>
          <span className="inline-flex items-baseline gap-1 text-sm text-muted-foreground">
            <span className="font-mono tabular-nums text-foreground"><SlidingNumber number={total} /></span>
            {total === 1 ? "note" : "notes"}
          </span>
        </div>

        {ephemeral && (
          <p className="mb-4 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
            Dev mode: no Upstash keys, so notes live in memory and reset when the server restarts.
          </p>
        )}

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <p className="font-medium">No notes yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">The wall is empty. Be the first name on it.</p>
          </div>
        ) : (
          <ul className="grid items-start gap-4 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {entries.map((e) => (
                <motion.li
                  key={e.id}
                  layout={!reduce}
                  initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="min-w-0"
                >
                  <article
                    style={{ "--tilt": `${tilt(e.id)}deg` } as React.CSSProperties}
                    className="rounded-xl border border-border bg-card p-4 transition-transform duration-300 ease-out sm:rotate-[var(--tilt)] sm:hover:rotate-0"
                  >
                    <header className="mb-2 flex items-center gap-2.5">
                      <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-medium text-foreground/80">
                        {initials(e.name)}
                      </span>
                      <span className="min-w-0 truncate text-sm font-medium">{e.name}</span>
                      {mine.has(e.id) && (
                        <span className="rounded-full bg-foreground px-1.5 py-px text-[10px] text-background">you</span>
                      )}
                      <time
                        dateTime={new Date(e.createdAt).toISOString()}
                        title={new Date(e.createdAt).toLocaleString()}
                        suppressHydrationWarning
                        className="ml-auto shrink-0 text-xs text-muted-foreground"
                      >
                        {relative(e.createdAt, now)}
                      </time>
                    </header>
                    <p className="text-[15px] leading-relaxed break-words whitespace-pre-line text-foreground/90">{e.message}</p>
                  </article>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        <div className="mt-6 text-center">
          {cursor ? (
            <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="rounded-full">
              {loadingMore && <Loader2 className="size-4 animate-spin" />}
              {loadingMore ? "Loading" : moreError ? "Couldn't load. Try again" : "Show older notes"}
            </Button>
          ) : (
            entries.length > 0 && <p className="text-sm text-muted-foreground">That&apos;s everyone so far.</p>
          )}
        </div>
      </section>
    </>
  );
}
