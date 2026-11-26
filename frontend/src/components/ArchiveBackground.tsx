import { useReducedMotion } from 'framer-motion';

export function ArchiveBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Subtle coordinate grid */}
      <div className="archive-grid-bg absolute inset-0 opacity-75" />

      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212, 168, 83, 0.06), transparent 70%), radial-gradient(ellipse 60% 50% at 85% 20%, rgba(108, 158, 255, 0.05), transparent 70%)',
        }}
      />

      {/* Abstract classified coordinate & reticle SVG motif */}
      <svg
        className={`absolute right-[-6%] top-6 h-[520px] w-[520px] opacity-[0.07] ${
          shouldReduceMotion ? '' : 'animate-subtle-drift'
        }`}
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="180" stroke="#D4A853" strokeWidth="0.75" strokeDasharray="4 6" />
        <circle cx="200" cy="200" r="130" stroke="#6C9EFF" strokeWidth="0.75" />
        <circle cx="200" cy="200" r="72" stroke="#D4A853" strokeWidth="0.5" strokeDasharray="2 4" />
        <line x1="200" y1="8" x2="200" y2="392" stroke="#9AA5BE" strokeWidth="0.5" />
        <line x1="8" y1="200" x2="392" y2="200" stroke="#9AA5BE" strokeWidth="0.5" />
        <text x="208" y="28" fill="#D4A853" fontSize="8" fontFamily="monospace">
          LAT 00°00&apos;00&quot;N
        </text>
        <text x="208" y="385" fill="#9AA5BE" fontSize="8" fontFamily="monospace">
          ARC-REF // DECLASSIFIED
        </text>
      </svg>
    </div>
  );
}
