import { Contestant, initials } from "@/lib/contestants";

export default function PortraitContent({ c, large, eager }: { c: Contestant; large?: boolean; eager?: boolean }) {
  const src = large ? c.photo : c.photoSm ?? c.photo;
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={c.name}
      width={large ? 800 : 480}
      height={large ? 1000 : 600}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
    />
  ) : (
    <span className="ini" aria-hidden="true">
      {initials(c.name)}
    </span>
  );
}
