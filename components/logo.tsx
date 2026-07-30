import React from 'react'

export function Logo({ className = "w-[48px] h-[48px]", showShadow = true }: { className?: string, showShadow?: boolean }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={showShadow ? {
        filter: 'drop-shadow(3px 3px 6px var(--shadow-dark)) drop-shadow(-3px -3px 6px var(--shadow-light))'
      } : undefined}
    >
      <defs>
        <linearGradient id="blossomGradLogo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F1699C"/>
          <stop offset="1" stopColor="#C22C63"/>
        </linearGradient>
      </defs>
      
      <rect x="6" y="6" width="88" height="88" rx="25" fill="url(#blossomGradLogo)"/>
      <ellipse cx="33" cy="27" rx="28" ry="15" fill="#FFFFFF" opacity="0.14" transform="rotate(-14 33 27)"/>
      <path fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF"
        d="M50,18 A32,32 0 1,0 50,82 A32,32 0 1,0 50,18 Z M61,37 A18,18 0 1,0 61,73 A18,18 0 1,0 61,37 Z"/>
      <path fill="#EFA23D" d="M76,52 L79,59 L86,62 L79,65 L76,72 L73,65 L66,62 L73,59 Z"/>
    </svg>
  )
}
