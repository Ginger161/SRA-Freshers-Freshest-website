"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_VOTES, OPENS_AT, PRICE_NAIRA, naira } from "@/lib/config";
import type { Contestant } from "@/lib/contestants";
import { usePhase } from "./usePhase";
import ShareButton from "./ShareButton";

declare global {
  interface Window {
    PaystackPop?: new () => {
      resumeTransaction: (
        accessCode: string,
        cb?: { onSuccess?: (t: unknown) => void; onCancel?: () => void; onError?: (e: unknown) => void }
      ) => void;
    };
  }
}

const PACKS = [10, 50, 100, 200];
const EMAIL_KEY = "ff_email";

let paystackLoading: Promise<void> | null = null;
function loadPaystack() {
  if (window.PaystackPop) return Promise.resolve();
  if (!paystackLoading) {
    paystackLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://js.paystack.co/v2/inline.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        paystackLoading = null;
        reject(new Error("paystack script failed"));
      };
      document.head.appendChild(s);
    });
  }
  return paystackLoading;
}

type Status =
  | { k: "idle" }
  | { k: "starting" }
  | { k: "paying" }
  | { k: "confirming"; ref: string }
  | { k: "done"; ref: string; votes: number }
  | { k: "error"; msg: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function VotePanel({ c }: { c: Contestant }) {
  const { phase } = usePhase();
  const [count, setCount] = useState(10);
  const [raw, setRaw] = useState("10");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ k: "idle" });
  const confirming = useRef<string | null>(null);

  useEffect(() => {
    try {
      const e = localStorage.getItem(EMAIL_KEY);
      if (e) setEmail(e);
    } catch {}
    loadPaystack().catch(() => {});
  }, []);

  const set = (n: number) => {
    const v = Math.max(1, Math.min(MAX_VOTES, Math.floor(n) || 1));
    setCount(v);
    setRaw(String(v));
  };

  const confirm = useCallback(async (ref: string) => {
    if (confirming.current === ref) return;
    confirming.current = ref;
    setStatus({ k: "confirming", ref });
    for (let i = 0; i < 30; i++) {
      try {
        const r = await fetch(`/api/vote/verify?ref=${encodeURIComponent(ref)}`, { cache: "no-store" });
        const j = await r.json();
        if (j.state === "paid") {
          setStatus({ k: "done", ref, votes: j.votes });
          return;
        }
        if (j.state === "failed") {
          setStatus({ k: "error", msg: "That payment didn’t go through. No money was taken for it." });
          confirming.current = null;
          return;
        }
        if (j.state === "flagged" || j.state === "unknown") {
          setStatus({ k: "error", msg: `We couldn’t match this payment. Send this reference to the SRA: ${ref}` });
          confirming.current = null;
          return;
        }
      } catch {}
      await sleep(i < 5 ? 1500 : 3000);
    }
    setStatus({ k: "error", msg: `Still waiting on Paystack for ${ref}. If you were debited, your votes will be added once it confirms.` });
    confirming.current = null;
  }, []);

  // returning from Paystack's redirect checkout
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref") || new URLSearchParams(window.location.search).get("reference");
    if (ref) {
      window.history.replaceState(null, "", window.location.pathname);
      confirm(ref);
    }
  }, [confirm]);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.k === "starting" || status.k === "paying") return;
    setStatus({ k: "starting" });
    try {
      localStorage.setItem(EMAIL_KEY, email.trim());
    } catch {}

    let init: { reference: string; accessCode: string; authorizationUrl: string; error?: string };
    try {
      const r = await fetch("/api/vote/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestantId: c.id, votes: count, email: email.trim() }),
      });
      init = await r.json();
      if (!r.ok) throw new Error(init.error || "Couldn’t start payment.");
    } catch (err) {
      setStatus({ k: "error", msg: (err as Error).message || "Network error. Try again." });
      return;
    }

    try {
      await loadPaystack();
      const Pop = window.PaystackPop;
      if (!Pop) throw new Error("no popup");
      setStatus({ k: "paying" });
      new Pop().resumeTransaction(init.accessCode, {
        onSuccess: () => confirm(init.reference),
        onCancel: () => setStatus({ k: "idle" }),
        onError: () => {
          window.location.href = init.authorizationUrl;
        },
      });
    } catch {
      window.location.href = init.authorizationUrl;
    }
  };

  const busy = status.k === "starting" || status.k === "paying" || status.k === "confirming";
  const open = phase === "open";

  return (
    <>
      <form className="panel" onSubmit={pay} data-reveal style={{ ["--d" as string]: "0.15s" }}>
        <div className="panel-head">
          <span className="serif">How many votes?</span>
          <small>₦{PRICE_NAIRA} each</small>
        </div>

        <div className="packs" role="radiogroup" aria-label="Vote bundles">
          {PACKS.map((n) => (
            <button type="button" key={n} role="radio" aria-checked={count === n} onClick={() => set(n)}>
              {n}
            </button>
          ))}
        </div>

        <div className="stepper">
          <button type="button" aria-label="One vote fewer" onClick={() => set(count - 1)}>
            −
          </button>
          <label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Number of votes"
              value={raw}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                setRaw(v);
                if (v) setCount(Math.max(1, Math.min(MAX_VOTES, Number(v))));
              }}
              onBlur={() => set(Number(raw))}
            />
            <span>votes</span>
          </label>
          <button type="button" aria-label="One vote more" onClick={() => set(count + 1)}>
            +
          </button>
        </div>

        <label className="field">
          <span>Email for your receipt</span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {status.k === "error" && <p className="err">{status.msg}</p>}

        {phase === null || open ? (
          <button className="btn btn-gold" type="submit" disabled={busy || phase === null}>
            {busy ? (
              <>
                <span className="spin" aria-hidden="true" />
                {status.k === "confirming" ? "Confirming payment" : "Opening Paystack"}
              </>
            ) : (
              <>Pay {naira(count * PRICE_NAIRA)}</>
            )}
          </button>
        ) : (
          <p className="note">{phase === "soon"
              ? `Voting opens ${OPENS_AT.toLocaleString("en-GB", { weekday: "long", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" })}.`
              : "Voting has closed."}</p>
        )}

        <span className="secure">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          Secured by Paystack · card, transfer or USSD
        </span>
      </form>

      {status.k === "done" && (
        <div className="done" role="dialog" aria-modal="true" aria-labelledby="done-title">
          <div className="done-inner">
            <div className="burst" aria-hidden="true">
              {[
                [-150, -140], [140, -160], [-180, 20], [170, 40], [-60, -210], [70, -200], [-120, 130], [120, 140], [0, -230], [-200, -60], [200, -80],
              ].map(([dx, dy], i) => (
                <i
                  key={i}
                  style={{
                    ["--dx" as string]: `${dx}px`,
                    ["--dy" as string]: `${dy}px`,
                    ["--d" as string]: `${0.15 + (i % 4) * 0.06}s`,
                    background: i % 3 === 0 ? "#F4EAD5" : i % 3 === 1 ? "#E3C489" : "#B8924F",
                  }}
                />
              ))}
              <svg viewBox="0 0 64 44">
                <path d="M4 14 L18 28 L32 6 L46 28 L60 14 L54 40 H10 Z" fill="rgba(227,196,137,0.15)" stroke="#E3C489" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="4" cy="12" r="3" fill="#E3C489" />
                <circle cx="32" cy="4" r="3" fill="#E3C489" />
                <circle cx="60" cy="12" r="3" fill="#E3C489" />
              </svg>
            </div>
            <p className="eyebrow" style={{ marginTop: 36 }}>
              Payment confirmed
            </p>
            <h1 id="done-title">
              <em>
                {status.votes.toLocaleString()} {status.votes === 1 ? "vote" : "votes"}
              </em>{" "}
              for {c.first}
            </h1>
            <div className="ref">
              <span>Reference</span>
              <b>{status.ref}</b>
            </div>
            <div className="done-actions">
              <ShareButton
                path={`/c/${c.id}`}
                text={`Vote ${c.name} for Freshest Fresher 2026/27`}
                className="btn btn-gold"
              />
              <button type="button" className="btn btn-ghost" onClick={() => setStatus({ k: "idle" })}>
                Vote again
              </button>
              <Link href="/#contenders" className="btn btn-ghost" style={{ border: 0, minHeight: 44 }}>
                Back to all contestants
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
