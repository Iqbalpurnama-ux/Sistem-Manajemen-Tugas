'use client'

import React from 'react'

interface ClayCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
}

export function ClayCheckbox({ checked, onCheckedChange, disabled, id }: ClayCheckboxProps) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
        ${checked 
          ? 'bg-success border-transparent shadow-sm' 
          : 'bg-transparent border-2 border-muted-foreground/30 hover:border-primary/50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
      `}
    >
      <svg
        className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  )
}
