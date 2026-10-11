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
    <div className={`flex items-center gap-2 font-bold tracking-wider select-none ${className}`}>
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-widest text-[#FFF4E3] ${sizeClasses.text}`}>
          EYE<span className="text-[#E8C477]">VENGERS</span>
        </span>
        <span className={`font-semibold tracking-[0.22em] text-[#FF5149] uppercase ${sizeClasses.sub} mt-0.5`}>
          Jodhpur • Festive Care
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
