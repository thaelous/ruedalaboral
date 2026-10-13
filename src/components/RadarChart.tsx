import React from 'react';
import { CompetencyScore } from '../types/leadership';

interface RadarChartProps {
  data: CompetencyScore[];
  size?: number;
  isPrintMode?: boolean;
  onSelectCompetency?: (id: string) => void;
  selectedId?: string | null;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 380,
  isPrintMode = false,
  onSelectCompetency,
  selectedId
}) => {
  const center = size / 2;
  const radius = (size / 2) - 62; // leave margin for labels
  const levels = [2, 4, 6, 8, 10];
  const count = data.length || 8;

  // Helper to get (x, y) coordinates for angle index and score (1 to 10)
  const getCoordinates = (index: number, score: number) => {
    // Start angle at top (-90 degrees / -PI/2)
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    const normalizedScore = Math.max(0, Math.min(10, score));
    const dist = (normalizedScore / 10) * radius;
    const x = center + dist * Math.cos(angle);
    const y = center + dist * Math.sin(angle);
    return { x, y, angle };
  };

  // Build SVG path string for polygon
  const buildPolygonPath = (scores: number[]) => {
    return scores
      .map((score, index) => {
        const { x, y } = getCoordinates(index, score);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ') + ' Z';
  };

  const actualScores = data.map(d => d.actual);
  const metaScores = data.map(d => d.meta);

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        aria-label="Gráfica de araña de la Rueda del Liderazgo"
      >
        <defs>
          <radialGradient id="actualFillGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.08" />
          </radialGradient>
          <radialGradient id="metaFillGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.03" />
          </radialGradient>
        </defs>

        {/* Concentric grid webs */}
        {levels.map((lvl) => {
          const webPath = Array.from({ length: count })
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(' ') + ' Z';

          return (
            <g key={`level-${lvl}`}>
              <path
                d={webPath}
                fill={lvl === 10 ? (isPrintMode ? '#fafafa' : '#f8fafc') : 'none'}
                stroke={isPrintMode ? '#cbd5e1' : '#e2e8f0'}
                strokeWidth={lvl === 10 ? '1.5' : '1'}
                strokeDasharray={lvl % 4 === 0 ? 'none' : '2,2'}
              />
              {/* Level value indicator on vertical axis */}
              <text
                x={center + 4}
                y={center - ((lvl / 10) * radius) + 4}
                fill={isPrintMode ? '#64748b' : '#94a3b8'}
                fontSize="9"
                fontFamily="sans-serif"
                fontWeight="500"
              >
                {lvl}
              </text>
            </g>
          );
        })}

        {/* Axes rays from center to edge */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(i, 10);
          const isSelected = selectedId === item.id;
          return (
            <line
              key={`axis-${item.id}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke={isSelected ? '#2563eb' : (isPrintMode ? '#cbd5e1' : '#e2e8f0')}
              strokeWidth={isSelected ? '1.8' : '1'}
            />
          );
        })}

        {/* Series 2: Meta Acordada (Dashed Line & Light Fill) */}
        <path
          d={buildPolygonPath(metaScores)}
          fill={isPrintMode ? 'none' : 'url(#metaFillGrad)'}
          stroke={isPrintMode ? '#0284c7' : '#0891b2'}
          strokeWidth="2.2"
          strokeDasharray="5,4"
        />

        {/* Series 1: Autoevaluación Actual (Solid Line & Vibrant Fill) */}
        <path
          d={buildPolygonPath(actualScores)}
          fill={isPrintMode ? 'rgba(37,99,235,0.06)' : 'url(#actualFillGrad)'}
          stroke={isPrintMode ? '#1e3a8a' : '#2563eb'}
          strokeWidth="2.6"
        />

        {/* Data points for Meta Acordada (dashed series) */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(i, item.meta);
          return (
            <circle
              key={`dot-meta-${item.id}`}
              cx={x}
              cy={y}
              r="3.5"
              fill="#ffffff"
              stroke={isPrintMode ? '#0284c7' : '#0891b2'}
              strokeWidth="2"
            />
          );
        })}

        {/* Data points for Autoevaluación Actual (solid series) */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(i, item.actual);
          const isSelected = selectedId === item.id;
          return (
            <g
              key={`dot-actual-${item.id}`}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => onSelectCompetency?.(item.id)}
            >
              <circle
                cx={x}
                cy={y}
                r={isSelected ? '5.5' : '4'}
                fill={isPrintMode ? '#1e3a8a' : '#2563eb'}
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          );
        })}

        {/* Labels around the perimeter */}
        {data.map((item, i) => {
          const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
          const labelDist = radius + 22;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          // Text alignment based on horizontal position
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (Math.cos(angle) > 0.25) textAnchor = 'start';
          else if (Math.cos(angle) < -0.25) textAnchor = 'end';

          const isSelected = selectedId === item.id;
          const isPP = item.isPuntoPalanca;
          const isPI = item.isPuntoImpacto;

          return (
            <g
              key={`label-${item.id}`}
              transform={`translate(${lx}, ${ly})`}
              className="cursor-pointer"
              onClick={() => onSelectCompetency?.(item.id)}
            >
              {/* Special Tag for P.P. or P.I. */}
              {isPP && (
                <text
                  x={textAnchor === 'start' ? 0 : textAnchor === 'end' ? 0 : 0}
                  y={-14}
                  textAnchor={textAnchor}
                  fill="#b45309"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="sans-serif"
                >
                  ★ P.P. (Palanca)
                </text>
              )}
              {isPI && (
                <text
                  x={textAnchor === 'start' ? 0 : textAnchor === 'end' ? 0 : 0}
                  y={-14}
                  textAnchor={textAnchor}
                  fill="#be123c"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="sans-serif"
                >
                  ▲ P.I. (Impacto)
                </text>
              )}

              {/* Competency title */}
              <text
                x={0}
                y={0}
                textAnchor={textAnchor}
                fill={isSelected ? '#1d4ed8' : (isPrintMode ? '#0f172a' : '#1e293b')}
                fontSize="10"
                fontWeight={isSelected || isPP || isPI ? '700' : '600'}
                fontFamily="sans-serif"
              >
                {item.name}
              </text>

              {/* Score indicators: Actual vs Meta */}
              <text
                x={0}
                y={12}
                textAnchor={textAnchor}
                fill={isPrintMode ? '#475569' : '#64748b'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="500"
              >
                {item.actual.toFixed(1)} / 10 · Meta {item.meta.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend & Official Requirement Disclaimer */}
      <div className="mt-2 flex items-center justify-center gap-6 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-blue-700 inline-block"></span>
          <span className="font-semibold text-slate-800">Autoevaluación Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-b-2 border-dashed border-cyan-600 inline-block"></span>
          <span className="font-semibold text-slate-800">Meta Acordada (Proyección)</span>
        </div>
      </div>
    </div>
  );
};
