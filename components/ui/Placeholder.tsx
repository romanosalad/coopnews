const palettes = [
  { bg: "#0F1A0A", a: "#C7F542", b: "#FF5A36", c: "#1F2E16" },
  { bg: "#1A1208", a: "#FF5A36", b: "#C7F542", c: "#2E1F12" },
  { bg: "#0A1418", a: "#9AD13E", b: "#FAFAF7", c: "#16242A" },
  { bg: "#181818", a: "#C7F542", b: "#FAFAF7", c: "#2A2A2A" },
  { bg: "#FAFAF7", a: "#0A0A0A", b: "#FF5A36", c: "#C7F542", light: true },
  { bg: "#1A0F0F", a: "#FF5A36", b: "#FAFAF7", c: "#2E1818" }
];

type PlaceholderProps = {
  idx: number;
};

export function Placeholder({ idx }: PlaceholderProps) {
  const p = palettes[idx % palettes.length];
  const variant = idx % 6;
  const inkColor = p.light ? "#0A0A0A" : "#FAFAF7";

  return (
    <div className="ph" style={{ background: p.bg }}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        {variant === 0 ? (
          <>
            <g stroke={p.a} strokeWidth="3" fill="none">
              <path d="M 80 220 Q 200 80 320 220" />
              <path d="M 110 230 Q 200 130 290 230" />
              <path d="M 140 240 Q 200 175 260 240" />
            </g>
            <circle cx="200" cy="240" r="8" fill={p.b} />
          </>
        ) : null}
        {variant === 1 ? (
          <>
            <path d="M 50 80 L 200 220 L 350 80 L 350 120 L 200 260 L 50 120 Z" fill={p.a} />
            <line x1="50" y1="40" x2="350" y2="40" stroke={p.b} strokeWidth="3" />
          </>
        ) : null}
        {variant === 2 ? (
          <>
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 11 }).map((__, c) => {
                const cx = 30 + c * 34;
                const cy = 30 + r * 34;
                const d = Math.hypot(cx - 200, cy - 150);
                const radius = Math.max(2, 12 - d / 18);
                return <circle key={`${r}-${c}`} cx={cx} cy={cy} r={radius} fill={p.a} opacity={0.85} />;
              })
            )}
            <rect x="170" y="120" width="60" height="60" fill={p.b} />
          </>
        ) : null}
        {variant === 3 ? (
          <>
            <defs>
              <pattern id={`stripes-${idx}`} patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(45)">
                <rect width="14" height="14" fill={p.bg} />
                <rect width="7" height="14" fill={p.a} />
              </pattern>
            </defs>
            <rect width="400" height="300" fill={`url(#stripes-${idx})`} opacity="0.55" />
            <circle cx="200" cy="150" r="80" fill={p.b} />
            <circle cx="200" cy="150" r="80" fill="none" stroke={inkColor} strokeWidth="2" />
          </>
        ) : null}
        {variant === 4 ? (
          <>
            <rect x="40" y="60" width="160" height="180" fill={p.a} />
            <rect x="220" y="60" width="140" height="40" fill={p.b} />
            <rect x="220" y="110" width="140" height="6" fill={inkColor} opacity="0.6" />
            <rect x="220" y="124" width="120" height="6" fill={inkColor} opacity="0.4" />
            <rect x="220" y="138" width="130" height="6" fill={inkColor} opacity="0.4" />
            <rect x="220" y="160" width="140" height="80" fill={p.c} />
          </>
        ) : null}
        {variant === 5 ? (
          <>
            <polygon points="0,0 260,0 0,200" fill={p.a} />
            <polygon points="400,300 140,300 400,100" fill={p.b} opacity="0.9" />
            <circle cx="200" cy="150" r="14" fill={inkColor} />
          </>
        ) : null}
      </svg>
    </div>
  );
}
