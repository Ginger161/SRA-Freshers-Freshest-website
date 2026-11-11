import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { byId, contestants } from "@/lib/contestants";
import PortraitContent from "@/components/Portrait";
import Holo from "@/components/Holo";
import ShareButton from "@/components/ShareButton";
import VotePanel from "@/components/VotePanel";

export function generateStaticParams() {
  return contestants.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = byId((await params).slug);
  if (!c) return {};
  const title = `Vote ${c.name} · Freshest Fresher 2026/27`;
  return {
    title,
    description: `${c.dept}. ₦100 per vote.`,
    openGraph: { title, description: `${c.dept}. ₦100 per vote.` },
  };
}

export default async function ContestantPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = byId((await params).slug);
  if (!c) notFound();

  return (
    <main className="cpage">
      <div className="cbar">
        <Link href="/#contenders" className="icon-btn" aria-label="Back to all contestants">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <ShareButton path={`/c/${c.id}`} text={`Vote ${c.name} for Freshest Fresher 2026/27`} />
      </div>

      <div className="cphoto-wrap">
        <Holo className="cphoto">
          <PortraitContent c={c} large eager />
          <span className="shade" aria-hidden="true" />
        </Holo>
      </div>

      <div className="cinfo">
        <div className="rise" style={{ ["--d" as string]: "0.25s" }}>
          <p className="eyebrow" style={{ color: "var(--gold)" }}>
            No. {c.no} · {c.gender === "f" ? "Ladies" : "Gentlemen"}
          </p>
          <h1 className="cname">{c.name}</h1>
          <span className="cdept">{c.dept}</span>
        </div>
        <VotePanel c={c} />
      </div>
    </main>
  );
}
