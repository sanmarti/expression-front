const zones = [
  {
    id: 'forest',
    label: 'Forest',
    fill: '#166534',
    d: 'M300,150 Q400,100 500,130 Q560,160 520,220 Q480,270 400,260 Q320,250 280,200 Z',
    lx: 400, ly: 185, labelFill: '#86EFAC',
  },
  {
    id: 'mountain',
    label: 'Mountains',
    fill: '#374151',
    d: 'M380,80 L420,40 L460,80 L500,50 L540,90 L520,140 L400,140 Z',
    lx: 460, ly: 115, labelFill: '#D1D5DB',
  },
  {
    id: 'beach',
    label: 'Beach',
    fill: '#FCD34D',
    opacity: 0.85,
    d: 'M250,500 Q400,540 550,510 Q600,490 580,560 Q400,590 220,560 Z',
    lx: 400, ly: 545, labelFill: '#92400E',
  },
  {
    id: 'jungle',
    label: 'Jungle',
    fill: '#065F46',
    d: 'M100,250 Q150,200 220,230 Q260,280 240,360 Q200,400 120,380 Q80,330 100,250 Z',
    lx: 170, ly: 305, labelFill: '#6EE7B7',
  },
  {
    id: 'desert',
    label: 'Desert',
    fill: '#D97706',
    opacity: 0.85,
    d: 'M700,250 Q760,220 800,270 Q820,330 790,400 Q740,430 680,390 Q650,330 700,250 Z',
    lx: 740, ly: 335, labelFill: '#FEF3C7',
  },
  {
    id: 'volcano',
    label: 'Volcano',
    fill: '#991B1B',
    d: 'M680,100 L720,50 L760,100 L750,160 L700,170 L660,150 Z',
    lx: 710, ly: 130, labelFill: '#FECACA',
  },
  {
    id: 'coast',
    label: 'Coast',
    fill: '#BAE6FD',
    opacity: 0.5,
    d: 'M180,320 Q200,220 320,140 Q480,80 640,130 Q800,190 840,340 Q840,500 640,580 Q400,620 200,560 Q140,480 180,320 Z',
    lx: 500, ly: 600, labelFill: '#0369A1',
  },
]

export default function IslandZones({ onZoneClick }) {
  return (
    <>
      {zones.map((z) => (
        <g key={z.id} className="island-zone" onClick={() => onZoneClick && onZoneClick(z.id)}>
          <path
            d={z.d}
            fill={z.fill}
            opacity={z.opacity ?? 0.9}
          />
          <text
            x={z.lx}
            y={z.ly}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill={z.labelFill}
            style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
          >
            {z.label}
          </text>
        </g>
      ))}
      {/* River */}
      <g className="island-zone" onClick={() => onZoneClick && onZoneClick('river')}>
        <path
          d="M420,140 Q380,200 400,280 Q420,350 380,430"
          fill="none"
          stroke="#1D4ED8"
          strokeWidth="12"
          opacity="0.8"
          strokeLinecap="round"
        />
        <text x="360" y="285" textAnchor="middle" fontSize="11" fontWeight="600" fill="#BFDBFE">
          River
        </text>
      </g>
      {/* Lake */}
      <g className="island-zone" onClick={() => onZoneClick && onZoneClick('lake')}>
        <ellipse cx="450" cy="420" rx="60" ry="40" fill="#0EA5E9" opacity="0.85" />
        <text x="450" y="424" textAnchor="middle" fontSize="11" fontWeight="600" fill="#E0F2FE">
          Lake
        </text>
      </g>
    </>
  )
}
