import React from 'react';

interface PixelCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const PixelCard: React.FC<PixelCardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`relative bg-slate-800 border-4 border-slate-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] p-4 ${className}`}>
      {title && (
        <div className="absolute -top-5 left-4 bg-slate-900 px-2 border-2 border-slate-600 text-slate-200 uppercase font-bold tracking-widest">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};