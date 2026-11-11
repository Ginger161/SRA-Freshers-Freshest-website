"use client";

import { useState } from "react";

export default function ShareButton({
  path,
  text,
  className = "icon-btn",
  label = "Share",
}: {
  path: string;
  text: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.origin + path;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Freshest Fresher 2026/27", text, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = `${text} ${url}`;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button type="button" className={className} onClick={share} aria-live="polite">
      <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
        <path d="M16 6l-4-4-4 4" />
        <path d="M12 2v13" />
      </svg>
      {copied ? "Link copied" : label}
    </button>
  );
}
