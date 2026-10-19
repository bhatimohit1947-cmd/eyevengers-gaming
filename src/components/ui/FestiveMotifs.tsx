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
      <svg width="100%" height="16" viewBox="0 0 600 16" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
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

export function DandiyaIcon({ className = "w-5 h-5 text-[#E8C477]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Stick 1 (Diagonal top-left to bottom-right) */}
      <g transform="rotate(25 16 16)">
        {/* Main stick body */}
        <rect x="14" y="3" width="4" height="26" rx="2" fill="#E8C477" />
        {/* Decorative bands */}
        <rect x="14" y="6" width="4" height="3" fill="#FF1493" />
        <rect x="14" y="11" width="4" height="2.5" fill="#00E676" />
        <rect x="14" y="15.5" width="4" height="3" fill="#FFD700" />
        <rect x="14" y="20.5" width="4" height="2.5" fill="#FF5149" />
        {/* Handle wrap */}
        <rect x="13.5" y="24" width="5" height="4" rx="1" fill="#681F2B" stroke="#E8C477" strokeWidth="0.5" />
        {/* Tip Bell / Ghungroo */}
        <circle cx="16" cy="3" r="1.5" fill="#FFD700" />
      </g>

      {/* Stick 2 (Diagonal top-right to bottom-left) */}
      <g transform="rotate(-25 16 16)">
        {/* Main stick body */}
        <rect x="14" y="3" width="4" height="26" rx="2" fill="#FFD700" />
        {/* Decorative bands */}
        <rect x="14" y="6" width="4" height="3" fill="#00E676" />
        <rect x="14" y="11" width="4" height="2.5" fill="#FF1493" />
        <rect x="14" y="15.5" width="4" height="3" fill="#E8C477" />
        <rect x="14" y="20.5" width="4" height="2.5" fill="#681F2B" />
        {/* Handle wrap */}
        <rect x="13.5" y="24" width="5" height="4" rx="1" fill="#8C1D40" stroke="#FFD700" strokeWidth="0.5" />
        {/* Tip Bell / Ghungroo */}
        <circle cx="16" cy="3" r="1.5" fill="#E8C477" />
      </g>

      {/* Center crossing sparkle accent */}
      <circle cx="16" cy="16" r="1.8" fill="#FFF1CF" />
    </svg>
  );
}

export function DandiyaBannerMotif({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Outer Glow Circle */}
      <circle cx="32" cy="32" r="28" stroke="#E8C477" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="32" cy="32" r="24" fill="#681F2B" fillOpacity="0.5" stroke="#FFD700" strokeWidth="1.2" />

      {/* Crossed Dandiya Pair */}
      <g transform="rotate(30 32 32)">
        <rect x="29" y="8" width="6" height="48" rx="3" fill="#FFD700" />
        <rect x="29" y="14" width="6" height="5" fill="#FF1493" />
        <rect x="29" y="23" width="6" height="4" fill="#00E676" />
        <rect x="29" y="31" width="6" height="5" fill="#E8C477" />
        <rect x="29" y="40" width="6" height="4" fill="#FF5149" />
        <rect x="28" y="47" width="8" height="7" rx="1.5" fill="#3D0E19" stroke="#E8C477" strokeWidth="0.8" />
        {/* Bells */}
        <circle cx="32" cy="8" r="2.5" fill="#FFF1CF" />
      </g>

      <g transform="rotate(-30 32 32)">
        <rect x="29" y="8" width="6" height="48" rx="3" fill="#E8C477" />
        <rect x="29" y="14" width="6" height="5" fill="#00E676" />
        <rect x="29" y="23" width="6" height="4" fill="#FF1493" />
        <rect x="29" y="31" width="6" height="5" fill="#FFD700" />
        <rect x="29" y="40" width="6" height="4" fill="#8C1D40" />
        <rect x="28" y="47" width="8" height="7" rx="1.5" fill="#681F2B" stroke="#FFD700" strokeWidth="0.8" />
        {/* Bells */}
        <circle cx="32" cy="8" r="2.5" fill="#FFF1CF" />
      </g>

      {/* Center Floral Stud */}
      <circle cx="32" cy="32" r="4.5" fill="#FF1493" stroke="#FFD700" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="2" fill="#FFF1CF" />
    </svg>
  );
}

export function DiyaIcon({ className = "w-4 h-4 text-[#FFD700]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Flame */}
      <path d="M12 2C12 2 15 6 15 8.5C15 10.16 13.66 11.5 12 11.5C10.34 11.5 9 10.16 9 8.5C9 6 12 2 12 2Z" fill="#FFA000" />
      <path d="M12 4C12 4 14 6.5 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.5 12 4 12 4Z" fill="#FFEB3B" />
      {/* Base / Diya Bowl */}
      <path d="M4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12H4Z" fill="#B71C1C" />
      <path d="M3 12C3 11.45 3.45 11 4 11H20C20.55 11 21 11.45 21 12C21 12.55 20.55 13 20 13H4C3.45 13 3 12.55 3 12Z" fill="#FFD700" />
    </svg>
  );
}

