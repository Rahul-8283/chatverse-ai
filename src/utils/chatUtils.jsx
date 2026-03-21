import React from 'react';

export const PERSONAS = [
  { id: 'assistant', icon: '🤖', name: 'Assistant' },
  { id: 'roast', icon: '🔥', name: 'Roast Bot' },
  { id: 'study', icon: '📚', name: 'Study Buddy' },
  { id: 'therapist', icon: '💆', name: 'Therapist' }
];

export const WELCOME_MSGS = {
  assistant: "Hi! I'm your AI Assistant. Ask me anything 😊",
  roast: "Oh great, another human who needs help 🙄 What do you want?",
  study: "Hey! Ready to learn something new today? 📚 What topic shall we tackle?",
  therapist: "Hello 💆 I'm here to listen. How are you feeling today?"
};

export const getBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

// Helper to format AI markdown responses
export const formatMessage = (text) => {
  if (!text) return "";
  return text.split('\n').map((line, idx) => {
    let isList = false;
    let content = line;
    if (content.trim().startsWith('* ')) {
      isList = true;
      content = content.trim().substring(2);
    }
    
    const parts = content.split(/(\*\*.*?\*\*)/g);
    const formattedLine = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });

    return (
      <div key={idx} className={`${isList ? 'ml-4 flex gap-2 mt-1.5' : 'mt-1.5'} leading-relaxed`}>
        {isList && <span className="font-bold inline-block">•</span>}
        <div className="inline">{formattedLine}</div>
      </div>
    );
  });
};

// Helper to render User content like images, audio, or text
export const renderUserContent = (text) => {
  if (text?.startsWith("[IMAGE]")) {
    const src = text.replace("[IMAGE]", "");
    return <img src={src} alt="uploaded" className="max-w-[200px] object-cover rounded-lg" />;
  }
  if (text?.startsWith("[AUDIO]")) {
    const parts = text.replace("[AUDIO]", "").split("|");
    const src = parts[0];
    const transcript = parts.slice(1).join("|");
    return (
      <div className="flex flex-col gap-2">
        {src && src !== "[Voice Message]" && <audio controls src={src} className="max-w-[200px] h-10" />}
        {transcript && <span className="italic text-sm text-primary-foreground/90">"{transcript}"</span>}
      </div>
    );
  }
  return <h4 className="text-sm md:text-base">{text}</h4>;
};
