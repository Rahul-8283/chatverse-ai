import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.png';

const SplashScreen = ({ onFinish }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fade out at 2.2s (leaves 300ms for transition)
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2200);

    // Call onFinish at 2.5s to unmount
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0d2420] transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Loading Bar at Top */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0a1f1a]">
        <div 
          className="h-full bg-[#25d366]" 
          style={{
            animation: 'fillBar 2.5s ease-in-out forwards'
          }}
        ></div>
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1 w-full">
        {/* Logo/Icon container with pulsing glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#25d366] rounded-full blur-[35px] opacity-40 animate-pulse"></div>
          <div className="relative flex items-center justify-center">
            <img src={logo} alt="ChatVerse Logo" className="w-[100px] h-[100px] object-contain drop-shadow-md relative z-10" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex items-center space-x-2 text-4xl font-bold tracking-tight mb-2">
          <span className="text-white">ChatVerse</span>
          <span className="text-[#25d366]">AI</span>
        </div>

        {/* Tagline */}
        <p className="text-gray-400 text-sm tracking-wide font-medium">
          Chat smarter, connect better
        </p>
      </div>

      <style>{`
        @keyframes fillBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
