/** Vector redraw of the Veritas University SRA seal. */
export default function Logo({ className, title = "Veritas University SRA" }: { className?: string; title?: string }) {
  // laurel leaves along the lower arc
  const leaves: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < 7; i++) {
    for (const side of [-1, 1]) {
      const deg = 90 + side * (16 + i * 9.5); // around the bottom (90° = straight down)
      const a = (deg * Math.PI) / 180;
      leaves.push({ x: 100 + 77 * Math.cos(a), y: 100 + 77 * Math.sin(a), r: deg + (side === 1 ? -60 : 60) });
    }
  }
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
      <defs>
        <path id="sealTop" d="M 30 100 A 70 70 0 0 1 170 100" />
      </defs>
      <circle cx="100" cy="100" r="98" fill="#F7F1E4" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="#141210" strokeWidth="4" />
      <circle cx="100" cy="100" r="87" fill="none" stroke="#141210" strokeWidth="1" />
      <circle cx="100" cy="100" r="54" fill="none" stroke="#141210" strokeWidth="2.5" />
      <text fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="19" letterSpacing="2.2" fill="#141210">
        <textPath href="#sealTop" startOffset="50%" textAnchor="middle">
          VERITAS UNIVERSITY
        </textPath>
      </text>
      <text x="100" y="98" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="36" letterSpacing="1" fill="#141210">
        SRA
      </text>
      {/* ribbon */}
      <path d="M 14 116 L 34 112 L 34 140 L 14 144 L 22 130 Z" fill="#7E1A1F" />
      <path d="M 186 116 L 166 112 L 166 140 L 186 144 L 178 130 Z" fill="#7E1A1F" />
      <path d="M 28 108 Q 100 96 172 108 L 172 134 Q 100 122 28 134 Z" fill="#B3262D" />
      <path d="M 28 108 Q 100 96 172 108" fill="none" stroke="#141210" strokeWidth="1.2" />
      <path d="M 28 134 Q 100 122 172 134" fill="none" stroke="#141210" strokeWidth="1.2" />
      {/* laurel */}
      {leaves.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx="3.4" ry="8" fill="#141210" transform={`rotate(${l.r} ${l.x} ${l.y})`} />
      ))}
      <path d="M 92 162 L 100 172 L 108 162" fill="none" stroke="#141210" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}
