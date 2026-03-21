import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause } from "react-icons/fi";

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

// WhatsApp sleek Audio Player component
const CustomAudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    
    const handleLoadedMetadata = () => {
      if (audio.duration && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-black/10 rounded-xl px-2.5 py-2 w-[220px] shadow-inner mb-1">
      <button 
        onClick={togglePlay} 
        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white/25 text-white hover:bg-white/35 transition-colors shadow-sm"
      >
        {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} className="ml-0.5" />}
      </button>
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full bg-black/25 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-white/90 h-full transition-all duration-100 ease-linear rounded-full" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-white/80 font-medium mt-1 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <audio ref={audioRef} src={src} className="hidden" preload="metadata" />
    </div>
  );
};

// Helper to render User content like images, audio, or text
export const renderUserContent = (text) => {
  if (text?.startsWith("[IMAGE]")) {
    const src = text.replace("[IMAGE]", "");
    return <img src={src} alt="uploaded" className="max-w-[200px] object-cover rounded-lg shadow-sm my-1" />;
  }
  if (text?.startsWith("[AUDIO]")) {
    const parts = text.replace("[AUDIO]", "").split("|");
    const src = parts[0];
    const transcript = parts.slice(1).join("|");
    return (
      <div className="flex flex-col gap-1.5 mt-0.5">
        {src && src !== "[Voice Message]" && <CustomAudioPlayer src={src} />}
        {transcript && <span className="italic text-[13px] text-primary-foreground/90 font-medium tracking-wide">"{transcript}"</span>}
      </div>
    );
  }
  return <h4 className="text-sm md:text-base leading-relaxed">{text}</h4>;
};
