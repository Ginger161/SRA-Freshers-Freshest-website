export const PRICE_NAIRA = 100;
export const PRICE_KOBO = PRICE_NAIRA * 100;
export const MAX_VOTES = 10000;

export const OPENS_AT = new Date(
  process.env.NEXT_PUBLIC_VOTING_OPENS_AT || "2026-11-11T18:00:00+01:00"
);
export const CLOSES_AT = new Date(
  process.env.NEXT_PUBLIC_VOTING_CLOSES_AT || "2026-11-12T15:00:00+01:00"
);

/** The Final 10: live top-7 race before close. */
export const RACE_SIZE = 7;
export const RACE_AT = new Date(
  process.env.NEXT_PUBLIC_RACE_AT ? process.env.NEXT_PUBLIC_RACE_AT : CLOSES_AT.getTime() - 10 * 60 * 1000
);

export type Phase = "soon" | "open" | "closed";
export const phaseAt = (t: number): Phase =>
  t < OPENS_AT.getTime() ? "soon" : t < CLOSES_AT.getTime() ? "open" : "closed";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
