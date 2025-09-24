// import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img 
        src="/ChatGPT Image Sep 23, 2025 at 04_46_26 PM.png" 
        alt="ChemTracer Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export default Logo;
