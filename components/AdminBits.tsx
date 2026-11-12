"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

/** Submit button that shows it's working while its server action runs. */
export function SubmitButton({
  children,
  pending: pendingLabel,
  className = "btn btn-ghost",
  style,
}: {
  children: React.ReactNode;
  pending?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending} aria-busy={pending} style={{ ...style, opacity: pending ? 0.85 : undefined, pointerEvents: pending ? "none" : undefined }}>
      {pending ? (
        <>
          <span className="spin" aria-hidden="true" style={className.includes("btn-gold") ? undefined : { borderColor: "rgba(227,196,137,0.25)", borderTopColor: "#E3C489" }} />
          {pendingLabel ?? "Working…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Keeps the dashboard numbers fresh without a manual reload. */
export function AutoRefresh({ every = 15000 }: { every?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => document.visibilityState === "visible" && router.refresh(), every);
    return () => clearInterval(id);
  }, [router, every]);
  return null;
}
