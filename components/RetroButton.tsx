import React from 'react';
import { soundManager } from '../utils/SoundManager';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success';
}

export const RetroButton: React.FC<RetroButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  onMouseEnter,
  ...props 
}) => {
  const baseStyles = "px-4 py-2 uppercase font-pixel tracking-widest text-lg border-2 active:translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]";
  
  const variants = {
    primary: "bg-blue-700 hover:bg-blue-600 border-blue-300 text-blue-100",
    danger: "bg-red-800 hover:bg-red-700 border-red-400 text-red-100",
    success: "bg-green-700 hover:bg-green-600 border-green-400 text-green-100",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundManager.playSFX('HOVER');
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundManager.playSFX('CLICK');
    if (onClick) onClick(e);
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};