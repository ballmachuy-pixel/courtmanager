'use client';

import { useEffect, useState } from 'react';

interface SkillScore {
  skill_name: string;
  score: number;
}

interface RadarChartProps {
  data: SkillScore[];
}

export default function RadarChart({ data }: RadarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!data || data.length === 0) return null;

  const animatedData = mounted ? data : data.map(d => ({ ...d, score: 0 }));

  const size = 300;
  const center = size / 2;
  const radius = 100;
  const sides = data.length;
  const angleStep = (Math.PI * 2) / sides;

  // Calculate points for the polygon
  const points = animatedData.map((d, i) => {
    const r = (d.score / 10) * radius;
    const x = center + r * Math.sin(i * angleStep);
    const y = center - r * Math.cos(i * angleStep);
    return `${x},${y}`;
  }).join(' ');

  // Calculate points for the background axes and circles
  const levels = [0.2, 0.4, 0.6, 0.8, 1];
  const axisLines = data.map((d, i) => {
    const x = center + radius * Math.sin(i * angleStep);
    const y = center - radius * Math.cos(i * angleStep);
    return { x, y, label: d.skill_name };
  });

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background Circles (Grid) */}
        {levels.map((level, idx) => (
          <polygon
            key={idx}
            points={axisLines.map((_, i) => {
              const r = level * radius;
              const x = center + r * Math.sin(i * angleStep);
              const y = center - r * Math.cos(i * angleStep);
              return `${x},${y}`;
            }).join(' ')}
            className="fill-none stroke-white/10 stroke-[1]"
          />
        ))}

        {/* Axis Lines */}
        {axisLines.map((axis, i) => (
          <g key={i}>
            <line 
              x1={center} y1={center} x2={axis.x} y2={axis.y} 
              className="stroke-white/10 stroke-[1]" 
            />
            {/* Labels */}
            <text
              x={center + (radius + 25) * Math.sin(i * angleStep)}
              y={center - (radius + 25) * Math.cos(i * angleStep)}
              textAnchor="middle"
              className="fill-white/30 text-[9px] font-black uppercase tracking-tighter"
            >
              {axis.label}
            </text>
          </g>
        ))}

        {/* Data Polygon */}
        <polygon
          points={points}
          className="fill-amber-500/30 stroke-amber-500 stroke-[3] transition-all duration-1000"
        />

        {/* Data Points */}
        {animatedData.map((d, i) => {
          const r = (d.score / 10) * radius;
          const x = center + r * Math.sin(i * angleStep);
          const y = center - r * Math.cos(i * angleStep);
          return (
            <circle key={i} cx={x} cy={y} r="4" className="fill-white stroke-amber-500 stroke-[2] transition-all duration-1000" />
          );
        })}
      </svg>
    </div>
  );
}
