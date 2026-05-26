export default function EarbudsHero({
  connected = false,
  battery = 0,
  size = 160,
}: {
  connected?: boolean;
  battery?: number;
  size?: number;
}) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 1.4, height: size * 1.2 }}>
      {/* Glow effect when connected */}
      {connected && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      )}

      <svg
        width={size}
        height={size * 0.85}
        viewBox="0 0 200 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Left earbud */}
        <g transform="translate(35, 25)">
          {/* Stem */}
          <rect x="22" y="65" width="8" height="45" rx="4"
            fill={connected ? '#e4e4e7' : '#3f3f46'}
            className="transition-all duration-700"
          />
          {/* Body */}
          <ellipse cx="26" cy="45" rx="22" ry="26"
            fill={connected ? '#d4d4d8' : '#27272a'}
            className="transition-all duration-700"
          />
          {/* Inner detail */}
          <ellipse cx="26" cy="40" rx="12" ry="14"
            fill={connected ? '#a1a1aa' : '#18181b'}
            className="transition-all duration-700"
          />
          {/* Sensor dot */}
          <circle cx="26" cy="38" r="3"
            fill={connected ? '#ffffff' : '#52525b'}
            className="transition-all duration-700"
          />
          {/* Tip */}
          <ellipse cx="26" cy="22" rx="10" ry="8"
            fill={connected ? '#c2c2c6' : '#27272a'}
            className="transition-all duration-700"
          />
        </g>

        {/* Right earbud */}
        <g transform="translate(105, 25)">
          {/* Stem */}
          <rect x="22" y="65" width="8" height="45" rx="4"
            fill={connected ? '#e4e4e7' : '#3f3f46'}
            className="transition-all duration-700"
          />
          {/* Body */}
          <ellipse cx="26" cy="45" rx="22" ry="26"
            fill={connected ? '#d4d4d8' : '#27272a'}
            className="transition-all duration-700"
          />
          {/* Inner detail */}
          <ellipse cx="26" cy="40" rx="12" ry="14"
            fill={connected ? '#a1a1aa' : '#18181b'}
            className="transition-all duration-700"
          />
          {/* Sensor dot */}
          <circle cx="26" cy="38" r="3"
            fill={connected ? '#ffffff' : '#52525b'}
            className="transition-all duration-700"
          />
          {/* Tip */}
          <ellipse cx="26" cy="22" rx="10" ry="8"
            fill={connected ? '#c2c2c6' : '#27272a'}
            className="transition-all duration-700"
          />
        </g>

        {/* Case (bottom) */}
        <rect x="45" y="118" width="110" height="38" rx="16"
          fill={connected ? '#2a2a2e' : '#1a1a1e'}
          stroke={connected ? '#52525b' : '#27272a'}
          strokeWidth="1"
          className="transition-all duration-700"
        />
        {/* Case lid line */}
        <line x1="55" y1="130" x2="145" y2="130"
          stroke="#3f3f46"
          strokeWidth="0.5"
        />
        {/* Case LED */}
        <circle cx="100" cy="142" r="3"
          fill={connected ? '#22c55e' : '#52525b'}
          className="transition-all duration-700"
        />
        {connected && (
          <circle cx="100" cy="142" r="3" fill="#22c55e" opacity="0.4">
            <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      {/* Battery indicators when connected */}
      {connected && battery > 0 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          <span className="text-[10px] text-gray-500 font-mono">L {battery}%</span>
          <span className="text-[10px] text-gray-500 font-mono">R {battery}%</span>
        </div>
      )}
    </div>
  );
}
