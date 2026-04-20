import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiX, FiArrowRight } from 'react-icons/fi';
import useApiStore from '../store/useApiStore.ts';

const DocumentTutorialModal = ({ setIsRagMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { isDocumentTutorialOpen, setIsDocumentTutorialOpen } = useApiStore();

  useEffect(() => {
    setIsModalOpen(isDocumentTutorialOpen);
  }, [isDocumentTutorialOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeModal = () => {
    setIsDocumentTutorialOpen(false);
  };

  const handleTryNow = () => {
    closeModal();
    // Switch to RAG mode when user clicks Try Now
    if(setIsRagMode){
      setIsRagMode(true);
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && !isMobile && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-accent rounded-2xl shadow-2xl p-8 w-[90vw] max-w-md z-[201]"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <FiX size={24} />
            </button>

            {/* Content */}
            <div className="flex flex-col items-start">
              {/* Icon */}
              <div className="p-3 bg-primary/85 rounded-lg border border-accent/30 mb-6">
                <FiFileText size={32} className="text-accent" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Unlock Document Mode
              </h2>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Upload your documents and chat with them instantly using AI. Get summaries, find information, and extract insights from your files with the power of AI.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-3 mb-8 w-full">
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Smart document analysis with AI
                </li>
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Ask questions about your files
                </li>
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Works with PDFs, images, and text files
                </li>
              </ul>

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleTryNow}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg border-2 border-primary shadow-lg hover:bg-primary/90 hover:border-accent transition-all flex items-center justify-center gap-2"
                >
                  Try Now <FiArrowRight size={18} />
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-muted text-foreground font-semibold py-3 px-4 rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>

          {/* Highlight Spotlight on Document Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[150]"
          >
            {/* Spotlight effect pointing to document button in navbar */}
            <motion.div
              animate={{ boxShadow: ['0 0 50px 25px rgba(141,184,122,0.8), 0 0 80px 40px rgba(141,184,122,0.4)', '0 0 70px 35px rgba(141,184,122,0.7), 0 0 100px 50px rgba(141,184,122,0.3)', '0 0 50px 25px rgba(141,184,122,0.8), 0 0 80px 40px rgba(141,184,122,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute lg:left-[14px] left-[46%] lg:top-[103px] top-[0px] -translate-x-1/2 lg:translate-x-0 w-16 h-16 rounded-full border-3 border-accent bg-accent/80 shadow-2xl"
            />
          {/* </motion.div> */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DocumentTutorialModal;
