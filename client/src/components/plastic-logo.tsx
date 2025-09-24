// import React from 'react';

interface PlasticLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlasticLogo({ className = '', size = 'md' }: PlasticLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img 
        src="/ChatGPT Image Sep 23, 2025 at 04_54_57 PM.png" 
        alt="Microplastic Tracker Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export default PlasticLogo;
