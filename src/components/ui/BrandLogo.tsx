import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

export function BrandLogo({ size = 'md', href = '/', className = '' }: BrandLogoProps) {
  const sizeClasses = {
    sm: { text: 'text-lg', sub: 'text-[9px]', icon: 'w-5 h-5' },
    md: { text: 'text-2xl', sub: 'text-[10px]', icon: 'w-7 h-7' },
    lg: { text: 'text-3xl md:text-4xl', sub: 'text-xs', icon: 'w-9 h-9' },
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 font-bold tracking-wider select-none ${className}`}>
      {/* Stylized Eyewear Monogram */}
      <div className={`relative flex items-center justify-center p-1.5 rounded-lg bg-gradient-to-br from-[#681F2B] to-[#21171A] border border-[#E8C477]/40 shadow-[0_0_12px_rgba(232,196,119,0.2)]`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeClasses.icon} text-[#E8C477]`}
        >
          {/* Eyewear frame */}
          <circle cx="6.5" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.5" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          {/* Bridge */}
          <path d="M11 11 Q12 9.5 13 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          {/* Temple arms */}
          <path d="M2 11 L3 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 11 L21 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          {/* Shimmer dot inside lenses */}
          <circle cx="5" cy="10" r="1" fill="#FFF1CF" />
          <circle cx="16" cy="10" r="1" fill="#FFF1CF" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-widest text-[#FFF4E3] ${sizeClasses.text}`}>
          EYE<span className="text-[#E8C477]">VENGERS</span>
        </span>
        <span className={`font-medium tracking-[0.2em] text-[#FF5149] uppercase ${sizeClasses.sub}`}>
          Jodhpur • Optical Care
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-transform hover:scale-[1.02]">
        {content}
      </Link>
    );
  }

  return content;
}
