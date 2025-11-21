import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Minimum display time of 1 second, then check if ready
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Wait for fade animation to complete before calling onComplete
      setTimeout(onComplete, 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      {/* Logo Container */}
      <div className="flex flex-col items-center space-y-8">
        {/* TtT Logo with Animation */}
        <div className="relative animate-pulse">
          <svg
            width="180"
            height="120"
            viewBox="0 0 240 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            {/* Rounded rectangle border */}
            <rect
              x="12"
              y="12"
              width="216"
              height="136"
              rx="20"
              stroke="#3b82f6"
              strokeWidth="12"
              fill="none"
              className="animate-pulse"
            />
            {/* TtT Text */}
            <text
              x="120"
              y="90"
              fontFamily="Arial, sans-serif"
              fontSize="90"
              fontWeight="bold"
              fill="#3b82f6"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              TtT
            </text>
            {/* Bottom decoration */}
            <rect
              x="90"
              y="130"
              width="60"
              height="20"
              rx="10"
              fill="#3b82f6"
            />
          </svg>
          
          {/* Glow effect */}
          <div className="absolute inset-0 blur-2xl opacity-30 bg-blue-500 rounded-full" />
        </div>

        {/* App Name */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Track the Thing
          </h1>
          <p className="text-blue-200 text-sm">Desktop Application</p>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Version footer */}
      <div className="absolute bottom-8 text-gray-400 text-sm">
        Version 0.1.0
      </div>
    </div>
  );
};

