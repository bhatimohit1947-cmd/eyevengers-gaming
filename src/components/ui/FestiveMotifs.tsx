import React from 'react';

export function MandalaMotif({ className = "w-24 h-24 text-[#E8C477]" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.6" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.6" opacity="0.8" />
      <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      
      {/* 8-pointed star petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 50 50)`}>
          <path d="M50 14 C52 24 57 28 50 36 C43 28 48 24 50 14 Z" stroke="currentColor" strokeWidth="0.8" fill="rgba(232,196,119,0.08)" />
          <path d="M50 4 C53 10 55 12 50 20 C45 12 47 10 50 4 Z" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="50" cy="8" r="1" fill="currentColor" />
        </g>
      ))}

      {/* Secondary mini petals */}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 50 50)`}>
          <line x1="50" y1="28" x2="50" y2="38" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 1" />
          <circle cx="50" cy="38" r="0.8" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

export function ToranBorder({ className = "w-full text-[#E8C477]" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center overflow-hidden py-1 opacity-60 ${className}`}>
      <svg width="100%" height="16" viewBox="0 0 600 16" fill="none" preserveAspectRatio="repeat-x" xmlns="http://www.w3.org/2000/svg">
        <pattern id="festive-arch" width="40" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 0 Q20 14 40 0" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <path d="M5 0 Q20 10 35 0" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6" />
          <circle cx="20" cy="11" r="1.5" fill="currentColor" />
          <line x1="20" y1="12" x2="20" y2="16" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="20" cy="15.5" r="1" fill="#FF5149" />
        </pattern>
        <rect width="100%" height="16" fill="url(#festive-arch)" />
      </svg>
    </div>
  );
}

export function FestiveStar({ className = "w-6 h-6 text-[#E8C477]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" fill="currentColor" opacity="0.9" />
      <circle cx="12" cy="12" r="2" fill="#21171A" />
    </svg>
  );
}

export function DiyaIcon({ className = "w-6 h-6 text-[#E8C477]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Flame */}
      <path d="M16 3 C18 7 19 10 16 14 C13 10 14 7 16 3 Z" fill="#FF5149" />
      <path d="M16 6 C17 9 17.5 10.5 16 12.5 C14.5 10.5 15 9 16 6 Z" fill="#FFF1CF" />
      {/* Diya Base */}
      <path d="M6 16 C6 24 26 24 26 16 C22 19 10 19 6 16 Z" fill="currentColor" />
      <ellipse cx="16" cy="16" rx="10" ry="2" fill="#681F2B" />
      <path d="M11 23 L21 23 L18 26 L14 26 Z" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
