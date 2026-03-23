import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start exit animation after 2.8s
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    // Call onFinish at 3.6s to unmount completely after exit animation finishes
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3600);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050907] overflow-hidden"
        >
          {/* Ambient Background Grid & Glows */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111a15_1px,transparent_1px),linear-gradient(to_bottom,#111a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 2 }}
            className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 max-w-5xl mx-auto">
            
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="mb-10 px-4 py-1.5 rounded-full border border-primary/30 bg-[#0a120e] flex items-center gap-2.5 backdrop-blur-sm shadow-[0_0_15px_rgba(141,184,122,0.1)]"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(141,184,122,0.8)]"></div>
              <span className="text-gray-300 text-xs sm:text-sm font-bold tracking-[0.15em] uppercase">Powered by Gemini 2.5</span>
            </motion.div>

            {/* Main Title */}
            <div className="flex flex-col sm:flex-row items-center justify-center relative mb-8">
              <motion.h1 
                initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl sm:text-7xl md:text-8xl lg:text-[120px] font-black tracking-[-0.04em] text-white leading-none uppercase italic pr-2 sm:pr-4"
              >
                CHATVERSE
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative mt-2 sm:mt-0"
              >
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[120px] font-black tracking-[-0.04em] text-primary leading-none uppercase italic relative z-10">
                  AI
                </h1>
                {/* Underline for AI */}
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1, ease: "circOut" }}
                  className="absolute -bottom-2 sm:-bottom-4 left-0 w-full h-2 sm:h-3 bg-[#2a3630] origin-left"
                />
                {/* Ambient Glow behind AI */}
                <div className="absolute inset-0 bg-primary blur-3xl opacity-20" />
              </motion.div>
            </div>

            {/* Subtext Paragraph */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
              className="text-muted-foreground text-center text-lg sm:text-xl lg:text-[22px] max-w-3xl leading-relaxed font-medium tracking-wide mt-6"
            >
              The autonomous communication cockpit for the next generation. <br className="hidden sm:block" />
              <span className="text-gray-300">Connect, Speak, and chat with your world.</span>
            </motion.p>

            {/* Loading Tracer Component */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[250px] h-[3px] bg-white/5 rounded-full overflow-hidden"
            >
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
