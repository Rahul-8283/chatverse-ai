import React, { useState } from 'react';
import { RiCloseLine, RiQuestionLine, RiLightbulbLine, RiRobot2Line, RiFileTextLine, RiMicLine, RiImageAddLine, RiSearchLine } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';

const HelpModal = ({ onClose }: { onClose?: () => void }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const features = [
    {
      icon: <RiRobot2Line className="w-6 h-6" />,
      title: "AI Chat",
      description: "Chat with AI in different personalities - Assistant, Roast Bot, Study Buddy, or Therapist. Each has a unique communication style."
    },
    {
      icon: <RiFileTextLine className="w-6 h-6" />,
      title: "Document Analysis",
      description: "Upload documents and ask questions about them. The AI will analyze and provide context-aware answers from your files."
    },
    {
      icon: <RiMicLine className="w-6 h-6" />,
      title: "Voice Messages",
      description: "Send voice messages instead of typing. Your voice will be converted to text and processed by the AI."
    },
    {
      icon: <RiImageAddLine className="w-6 h-6" />,
      title: "Image Analysis",
      description: "Upload images for the AI to analyze. Get descriptions, text extraction, or answers about the image content."
    },
    {
      icon: <RiSearchLine className="w-6 h-6" />,
      title: "Search Users",
      description: "Find and connect with other ChatVerse users. Use the search feature to start conversations with friends."
    },
  ];

  const tips = [
    "Switch between Chat and Document modes using the document icon on the left sidebar",
    "Choose different AI personalities to match your communication preference",
    "Upload PDFs, images, or text files for context-aware AI responses",
    "Use voice recording for hands-free interaction",
    "Visit Settings to update your profile, change password, or delete your account",
    "Try combining multiple features - upload a document and ask follow-up questions"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-lg shadow-xl max-w-2xl w-[90%] max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <RiQuestionLine className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Help & Guide</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <RiCloseLine className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* About Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <RiLightbulbLine className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">About ChatVerse AI</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  ChatVerse AI is an intelligent chat platform that combines real-time messaging with advanced AI capabilities. 
                  Connect with other users, chat with AI assistants in different personalities, analyze documents with AI, and 
                  interact through voice or images. All in one seamless experience.
                </p>
              </section>

              {/* Features Section */}
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-primary flex-shrink-0">
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* How to Use Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <RiQuestionLine className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">How to Use Effectively</h3>
                </div>
                <div className="space-y-3">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-muted-foreground pt-0.5">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tips Section */}
              <section className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Use specific AI personalities for different conversation types</li>
                  <li>• Upload documents for context-aware AI responses</li>
                  <li>• Check your settings regularly for the best experience</li>
                  <li>• The AI respects your privacy - all conversations are encrypted</li>
                </ul>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpModal;
