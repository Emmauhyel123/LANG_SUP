import React from 'react';

interface PillarRadarProps {
  scores: {
    communication: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  benchmark?: {
    communication: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  size?: number;
  showLabels?: boolean;
}

export const PillarRadarChart: React.FC<PillarRadarProps> = ({
  scores,
  benchmark,
  size = 280,
  showLabels = true,
}) => {
  const center = size / 2;
  const radius = (size / 2) - (showLabels ? 42 : 16);

  const pillars = [
    { key: 'communication', label: 'Communication', score: scores.communication },
    { key: 'speaking', label: 'Speaking', score: scores.speaking },
    { key: 'listening', label: 'Listening', score: scores.listening },
    { key: 'reading', label: 'Reading', score: scores.reading },
    { key: 'writing', label: 'Writing', score: scores.writing },
  ];

  const totalAxes = pillars.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Compute point for a given axis index and score (0 to 100)
  const getPoint = (index: number, score: number) => {
    const angle = index * angleStep - Math.PI / 2; // start from top (12 o'clock)
    const distance = (Math.min(Math.max(score, 0), 100) / 100) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  const scorePoints = pillars.map((p, idx) => getPoint(idx, p.score));
  const scorePath = scorePoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ') + ' Z';

  let benchmarkPath = '';
  if (benchmark) {
    const bmPoints = pillars.map((p, idx) => {
      const bmVal = benchmark[p.key as keyof typeof benchmark] ?? 75;
      return getPoint(idx, bmVal);
    });
    benchmarkPath = bmPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ') + ' Z';
  }

  // Grid concentric rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center select-none">
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric guide polygons */}
        {rings.map((ringScale, rIdx) => {
          const ringPoints = pillars.map((_, pIdx) => {
            const angle = pIdx * angleStep - Math.PI / 2;
            const dist = ringScale * radius;
            return {
              x: center + dist * Math.cos(angle),
              y: center + dist * Math.sin(angle),
            };
          });
          const pathD = ringPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ') + ' Z';
          return (
            <path
              key={rIdx}
              d={pathD}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={rIdx === 3 ? 'none' : '2,2'}
            />
          );
        })}

        {/* Axis spokes */}
        {pillars.map((_, idx) => {
          const outerPt = getPoint(idx, 100);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={outerPt.x}
              y2={outerPt.y}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark polygon if present */}
        {benchmarkPath && (
          <path
            d={benchmarkPath}
            fill="rgba(148, 163, 184, 0.12)"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />
        )}

        {/* Student score filled polygon */}
        <path
          d={scorePath}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#2563eb"
          strokeWidth="2.2"
        />

        {/* Score vertex dots */}
        {scorePoints.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r="4.5"
            fill="#1d4ed8"
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}

        {/* Labels around perimeter */}
        {showLabels &&
          pillars.map((p, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const labelRadius = radius + 22;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);

            // Anchor logic
            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) textAnchor = 'start';
            else if (Math.cos(angle) < -0.3) textAnchor = 'end';

            return (
              <g key={idx} transform={`translate(${x}, ${y})`}>
                <text
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className="text-[11px] font-medium fill-slate-700 font-sans"
                >
                  {p.label}
                </text>
                <text
                  textAnchor={textAnchor}
                  y={13}
                  className="text-[10px] font-mono tabular-nums font-semibold fill-blue-700"
                >
                  {Math.round(p.score)}/100
                </text>
              </g>
            );
          })}
      </svg>
      {benchmark && (
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-blue-600 rounded-sm inline-block" />
            <span>Assessed Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-slate-400 border-dashed inline-block" />
            <span>Target Benchmark</span>
          </div>
        </div>
      )}
    </div>
  );
};
