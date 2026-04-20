import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiX, FiArrowRight } from 'react-icons/fi';
import useApiStore from '../store/useApiStore.ts';

const DocumentTutorialModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isDocumentTutorialOpen, setIsDocumentTutorialOpen } = useApiStore();

  useEffect(() => {
    setIsModalOpen(isDocumentTutorialOpen);
  }, [isDocumentTutorialOpen]);

  const closeModal = () => {
    setIsDocumentTutorialOpen(false);
  };

  const handleTryNow = () => {
    closeModal();
    // Trigger document mode switch if needed
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary border border-white/10 rounded-2xl shadow-2xl p-8 w-[90vw] max-w-md z-[201]"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>

            {/* Content */}
            <div className="flex flex-col items-start">
              {/* Icon */}
              <div className="p-3 bg-primary rounded-lg border border-accent/30 mb-6">
                <FiFileText size={32} className="text-accent" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-3">
                Unlock Document Mode
              </h2>

              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Upload your documents and chat with them instantly using RAG (Retrieval-Augmented Generation). Get summaries, find information, and extract insights from your files with the power of AI.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-3 mb-8 w-full">
                <li className="flex items-center gap-3 text-gray-200 text-sm">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Smart document analysis with AI
                </li>
                <li className="flex items-center gap-3 text-gray-200 text-sm">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Ask questions about your files
                </li>
                <li className="flex items-center gap-3 text-gray-200 text-sm">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Works with PDFs, images, and text files
                </li>
              </ul>

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleTryNow}
                  className="flex-1 bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent/90 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Try Now <FiArrowRight size={18} />
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-primary/50 text-gray-300 font-semibold py-3 px-4 rounded-lg hover:bg-primary/70 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>

            {/* Animated Border */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 opacity-0 animate-pulse" />
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
              animate={{ boxShadow: ['0 0 30px 15px rgba(141,184,122,0.4)', '0 0 40px 20px rgba(141,184,122,0.3)', '0 0 30px 15px rgba(141,184,122,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute lg:left-[62px] left-[50%] lg:top-[85px] top-[20px] -translate-x-1/2 lg:translate-x-0 w-12 h-12 rounded-full border-2 border-accent/50"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DocumentTutorialModal;
