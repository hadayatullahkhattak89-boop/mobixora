import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  light?: boolean;
}

export function Logo({
  className = '',
  size = 'md',
  showTagline = true,
  light = false,
}: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Hexagonal Circuit Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full p-1.5"
        >
          {/* Futuristic M / Circuit geometry */}
          <path
            d="M8 26V11L18 20L28 11V26"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="20" r="2.2" fill="#38bdf8" />
          <circle cx="8" cy="11" r="1.8" fill="white" />
          <circle cx="28" cy="11" r="1.8" fill="white" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center tracking-tight">
          <span className={`font-black uppercase tracking-wider ${textSizes[size]} ${light ? 'text-white' : 'text-slate-900'}`}>
            MOBI
          </span>
          <span className={`font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent ${textSizes[size]}`}>
            XORA
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-semibold tracking-widest uppercase mt-0.5 ${taglineSizes[size]} ${
              light ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Smart Tech. Better Life.
          </span>
        )}
      </div>
    </Link>
  );
}
