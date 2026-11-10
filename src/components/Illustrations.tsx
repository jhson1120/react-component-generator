export function TreeMark() {
  return (
    <svg className="brand-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="11" y="14" width="2.4" height="8" rx="1" fill="#5b4636" />
      <circle cx="12" cy="9" r="6.5" fill="#2f4a3a" />
      <circle cx="8.5" cy="12" r="3.8" fill="#3f6049" />
      <circle cx="16" cy="11.5" r="4" fill="#3f6049" />
    </svg>
  );
}

export function MorningScene() {
  return (
    <svg className="scene" viewBox="0 0 320 150" aria-hidden="true">
      <circle cx="232" cy="46" r="22" fill="#e8b35e" opacity="0.92" />
      <path d="M0 118 Q70 84 140 108 T320 100 V150 H0 Z" fill="#cfdacb" />
      <path d="M0 132 Q90 114 180 128 T320 124 V150 H0 Z" fill="#a9bfa6" />

      <rect x="67" y="80" width="7" height="50" rx="2" fill="#5b4636" />
      <circle cx="70" cy="64" r="23" fill="#2f4a3a" />
      <circle cx="53" cy="80" r="14" fill="#3f6049" />
      <circle cx="89" cy="78" r="15" fill="#3f6049" />

      <g stroke="#2a1f19" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="136" y="116" width="38" height="9" rx="1.5" fill="#7c8f6c" />
        <rect x="141" y="107" width="29" height="9" rx="1.5" fill="#c9a66b" />
      </g>

      <g stroke="#2a1f19" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="250" cy="130" rx="28" ry="5" fill="#fbfaf6" />
        <path d="M232 108 h36 v10 a18 14 0 0 1 -36 0 z" fill="#fbfaf6" />
        <path d="M268 112 h6 a6 6 0 0 1 0 12 h-8" fill="none" />
        <ellipse cx="250" cy="108" rx="18" ry="3" fill="#6b4a38" />
      </g>
      <g
        className="steam"
        fill="none"
        stroke="#2a1f19"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      >
        <path d="M243 98 q-5 -8 0 -15 q5 -7 0 -14" />
        <path d="M257 98 q-5 -8 0 -15 q5 -7 0 -14" />
      </g>
    </svg>
  );
}
