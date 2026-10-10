'use client';

import React from 'react';

export function FestiveLights() {
  const bulbs = [
    { color: '#FF1493', glow: 'rgba(255, 20, 147, 0.8)', delay: '0s' },
    { color: '#FFD700', glow: 'rgba(255, 215, 0, 0.8)', delay: '0.4s' },
    { color: '#00E5FF', glow: 'rgba(0, 229, 255, 0.8)', delay: '0.8s' },
    { color: '#FF3D00', glow: 'rgba(255, 61, 0, 0.8)', delay: '1.2s' },
    { color: '#00E676', glow: 'rgba(0, 230, 118, 0.8)', delay: '0.2s' },
    { color: '#FFEB3B', glow: 'rgba(255, 235, 59, 0.8)', delay: '0.6s' },
    { color: '#E040FB', glow: 'rgba(224, 64, 251, 0.8)', delay: '1.0s' },
    { color: '#FF9100', glow: 'rgba(255, 145, 0, 0.8)', delay: '1.4s' },
    { color: '#00F5D4', glow: 'rgba(0, 245, 212, 0.8)', delay: '0.3s' },
    { color: '#FF0055', glow: 'rgba(255, 0, 85, 0.8)', delay: '0.7s' },
    { color: '#FFD166', glow: 'rgba(255, 209, 102, 0.8)', delay: '1.1s' },
    { color: '#06D6A0', glow: 'rgba(6, 214, 160, 0.8)', delay: '1.5s' },
    { color: '#118AB2', glow: 'rgba(17, 138, 178, 0.8)', delay: '0.5s' },
    { color: '#EF476F', glow: 'rgba(239, 71, 111, 0.8)', delay: '0.9s' },
  ];

  return (
    <div className="w-full overflow-hidden pointer-events-none select-none z-30 relative py-1">
      {/* Wire string */}
      <svg className="w-full h-5 absolute top-0 inset-x-0" preserveAspectRatio="none" viewBox="0 0 1200 20">
        <path
          d="M0,4 Q50,14 100,4 Q150,14 200,4 Q250,14 300,4 Q350,14 400,4 Q450,14 500,4 Q550,14 600,4 Q650,14 700,4 Q750,14 800,4 Q850,14 900,4 Q950,14 1000,4 Q1050,14 1100,4 Q1150,14 1200,4"
          fill="none"
          stroke="rgba(255, 215, 0, 0.4)"
          strokeWidth="1.2"
        />
      </svg>

      {/* Row of glowing festival lights */}
      <div className="flex justify-around items-start max-w-7xl mx-auto px-2 relative pt-2">
        {bulbs.map((bulb, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center animate-pulse"
            style={{
              animationDuration: '1.8s',
              animationDelay: bulb.delay,
            }}
          >
            {/* Socket cap */}
            <div className="w-1.5 h-1.5 bg-[#4A3B22] rounded-t-sm" />
            {/* Colorful glowing bulb teardrop */}
            <div
              className="w-3.5 h-4 sm:w-4 sm:h-5 rounded-full"
              style={{
                backgroundColor: bulb.color,
                boxShadow: `0 0 12px 3px ${bulb.glow}, 0 0 24px 6px ${bulb.glow}`,
                borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
