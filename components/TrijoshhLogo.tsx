import React from 'react';

interface TrijoshhLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const TrijoshhLogo: React.FC<TrijoshhLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
    xl: 'h-24 w-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* TRIJOSHH Logo Design */}
      <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-lg flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1 w-1 h-1 bg-white rounded-full"></div>
        </div>
        
        {/* Main Logo Text */}
        <div className="relative z-10 text-center">
          <div className="text-white font-bold leading-none">
            <div className="text-xs tracking-wide">TRJ</div>
            <div className="text-[6px] tracking-widest opacity-90">OSHH</div>
          </div>
        </div>
        
        {/* Corner Accent */}
        <div className="absolute bottom-0 right-0 w-0 h-0 border-l-4 border-b-4 border-l-transparent border-b-blue-300 opacity-60"></div>
      </div>
    </div>
  );
};

export default TrijoshhLogo;