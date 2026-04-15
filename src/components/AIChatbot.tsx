import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { RiSendPlaneFill, RiLoader4Line } from "react-icons/ri";
import { FiImage, FiMic, FiX, FiPlus } from "react-icons/fi";
import { useApiStore } from '../store/useApiStore';
import { saveAIMessage, listenForAIMessages } from '../firebase/firebase';
import formatTimestamp from '../utils/formatTimestamp';
import { auth } from '../firebase/firebase';
import { PERSONAS, WELCOME_MSGS, getBase64, formatMessage, renderUserContent } from '../utils/chatUtils';

const AIChatbot = () => {

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { sendChat, sendImageScan, sendVoice, uploadDocument, ragChat } = useApiStore();
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // New features' states
  const [selectedPersona, setSelectedPersona] = useState("assistant");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRagMode, setIsRagMode] = useState(false);
  const [uploadedDocName, setUploadedDocName] = useState("");

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Generate conversation ID based on mode and persona
  useEffect(() => {
    if (isRagMode) {
      // In Analysis mode, use persona-specific analysis conversations
      setConversationId(`rag-${selectedPersona}`);
    } else {
      setConversationId(selectedPersona);
    }
  }, [selectedPersona, isRagMode]);

  // Listen to Firestore messages
  useEffect(() => {
    if (!conversationId || !auth.currentUser) return;

    unsubscribeRef.current = listenForAIMessages(
      auth.currentUser.uid,
      conversationId,
      setMessages
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, imagePreview]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const aTime = a?.timestamp?.seconds || 0;
      const bTime = b?.timestamp?.seconds || 0;
      return aTime - bTime;
    });
  }, [messages]);

  const handlePersonaChange = (personaId) => {
    setSelectedPersona(personaId);
    setMessages([]); // Temporarily clear UI until firestore syncs
  };

  const handleSendMessage = async (e?: any) => {
    if (e) e.preventDefault();

    if (!messageText.trim()) {
      toast.error("Please type a message");
      return;
    }

    if (!conversationId || !auth.currentUser) return;

    const userMessageText = messageText;
    setMessageText("");
    setIsLoading(true);

    try {
      await saveAIMessage(
        auth.currentUser.uid,
        conversationId,
        userMessageText,
        "user"
      );

      if (isRagMode) {
        const response = await ragChat(userMessageText, selectedPersona);
        await saveAIMessage(
          auth.currentUser.uid,
          conversationId,
          response,
          "ai"
        );
      } else {
        const historyForAPI = sortedMessages.map(msg => {
          let text = msg.text || "";
          if (text.startsWith("[IMAGE]")) text = "[Image Uploaded]";
          if (text.startsWith("[AUDIO]")) text = text.split("|").slice(1).join("|");
          return {
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text }]
          };
        });

        const res = await sendChat({
          message: userMessageText,
          history: historyForAPI,
          persona: selectedPersona
        });

        await saveAIMessage(
          auth.currentUser.uid,
          conversationId,
          res.data.reply,
          "ai"
        );
      }
    } catch (error) {
      console.error("Error in chat:", error);
      toast.error("Failed to send message: " + (error?.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const cancelImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendImage = async () => {
    if (!imageFile) return;

    const fileToSend = imageFile;
    const userPrompt = messageText || "Analyze and describe this image in detail.";

    // Save user message with image
    const userMessageText = messageText ? `[IMAGE QUERY] ${messageText}` : "[IMAGE QUERY] Analyze this image";

    // Clear UI
    cancelImagePreview();
    setMessageText("");
    setIsLoading(true);

    try {
      // Save user message notification
      try {
        const base64Image = await getBase64(fileToSend);
        await saveAIMessage(auth.currentUser.uid, conversationId, `[IMAGE]${base64Image}|${userPrompt}`, "user");
      } catch (e) {
        await saveAIMessage(auth.currentUser.uid, conversationId, `${userMessageText}`, "user");
      }

      // Send to backend with user's prompt
      const res = await sendImageScan(fileToSend, userPrompt);

      await saveAIMessage(auth.currentUser.uid, conversationId, res.data.reply, "ai");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process image: " + (error?.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await sendVoiceMessage(audioBlob);
        } finally {
          // Stop stream tracks after sending is complete
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied", error);
      toast.error("Microphone access denied");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      // Don't stop tracks or set isRecording false here - let onstop callback handle it
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    }
    else {
      handleStartRecording();
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    if (!auth.currentUser || !conversationId) {
      toast.error("Not authenticated or conversation not ready");
      return;
    }

    setIsLoading(true);
    try {
      if (isRagMode) {
        // Analysis Mode: Upload audio like a document
        await uploadDocument(audioBlob);
        await saveAIMessage(
          auth.currentUser.uid,
          conversationId,
          `✅ Successfully uploaded audio. You can now ask questions about it.`,
          "ai"
        );
      }
      else {
        // Persona Mode: Transcribe audio and send as text
        const res = await sendVoice(audioBlob);
        const transcript = res.data.transcript;

        if (!transcript || transcript.trim() === "") {
          toast.error("Could not transcribe audio. Please try again.");
          return;
        }

        const base64Audio = await getBase64(audioBlob);
        try {
          await saveAIMessage(auth.currentUser.uid, conversationId, `[AUDIO]${base64Audio}|${transcript}`, "user");
        } catch (e) {
          await saveAIMessage(auth.currentUser.uid, conversationId, `[Voice]: ${transcript}`, "user");
        }

        const historyForAPI = sortedMessages.map(msg => {
          let text = msg.text || "";
          if (text.startsWith("[IMAGE]")) text = "[Image Uploaded]";
          if (text.startsWith("[AUDIO]")) text = text.split("|").slice(1).join("|");
          return {
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text }]
          };
        });

        const chatRes = await sendChat({
          message: transcript,
          history: historyForAPI,
          persona: selectedPersona
        });

        await saveAIMessage(auth.currentUser.uid, conversationId, chatRes.data.reply, "ai");
      }
    } catch (error) {
      console.error("Voice message error:", error);
      toast.error("Failed to process voice: " + (error?.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (file) => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'audio/mpeg', 'audio/wav'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload PDF, JPG, PNG, MP3, or WAV");
      return;
    }

    setIsLoading(true);
    try {
      await uploadDocument(file);
      setUploadedDocName(file.name);
      await saveAIMessage(
        auth.currentUser.uid,
        conversationId,
        `✅ Successfully uploaded "${file.name}". You can now ask questions about it.`,
        "ai"
      );
      if (docInputRef.current) docInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to upload file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageInRag = async () => {
    if (!imageFile || !auth.currentUser) return;

    const prompt = messageText || "Analyze this image from the document.";
    const userMessageText = messageText ? `[IMAGE QUERY] ${messageText}` : "[IMAGE QUERY] Analyze this image";
    const fileToSend = imageFile;
    cancelImagePreview();
    setMessageText("");
    setIsLoading(true);

    try {
      try {
        const base64Image = await getBase64(fileToSend);
        await saveAIMessage(auth.currentUser.uid, conversationId, `[IMAGE]${base64Image}|${prompt}`, "user");
      } catch (e) {
        await saveAIMessage(auth.currentUser.uid, conversationId, `${userMessageText}`, "user");
      }

      await uploadDocument(fileToSend);

      const response = await ragChat(prompt, selectedPersona);

      await saveAIMessage(auth.currentUser.uid, conversationId, response, "ai");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to process image");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <section className='flex flex-col items-start justify-start h-[100dvh] w-[100%] background-image overflow-hidden'>
      {/* Chat Header */}
      <header className='flex-shrink-0 border-b border-border w-[100%] h-[70px] md:h-fit p-4 bg-card z-10'>
        <main className='flex items-center justify-between '>
          <div className='flex items-center gap-3'>
            <span>
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">{PERSONAS.find(p => p.id === selectedPersona).icon}</span>
              </div>
            </span>
            <span>
              <h3 className="font-semibold text-foreground text-lg">
                {isRagMode ? `${PERSONAS.find(p => p.id === selectedPersona).name} Analysis` : PERSONAS.find(p => p.id === selectedPersona).name}
              </h3>
              <p className="font-light text-muted-foreground text-sm">
                @chatverse-ai
              </p>
            </span>
          </div>

          {/* RAG Mode Toggle */}
          <button
            onClick={() => {
              setIsRagMode(!isRagMode);
              setMessages([]);
              setUploadedDocName("");
              setImagePreview(null);
              setImageFile(null);
            }}
            className={`px-3 py-1.5 rounded-md mr-2 text-sm font-medium transition-colors ${isRagMode
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            {isRagMode ? "Analysis" : "Analysis"}
          </button>
        </main>
      </header>

      {/* Chat Messages Area */}
      <main className="flex-1 w-full min-h-0 flex flex-col justify-between border-t border-transparent relative">
        <section className="px-3 pt-5 pb-2 flex-1 min-h-0 overflow-hidden">
          <div ref={scrollRef} className="overflow-y-auto overflow-x-hidden h-full pb-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="text-6xl mb-4">{isRagMode ? "📄" : PERSONAS.find(p => p.id === selectedPersona).icon}</div>
                <h2 className="text-2xl font-bold text-foreground mb-4 w-3/4 leading-relaxed">
                  {isRagMode
                    ? "Upload documents for deep analysis or ask a question"
                    : WELCOME_MSGS[selectedPersona]
                  }
                </h2>
              </div>
            )}

            {/* Messages */}
            {sortedMessages?.map((msg, index) => (
              <div
                key={index}
                className={msg?.sender === "user" || msg?.role === "user" ? "flex flex-col items-end w-full mb-5" : "flex flex-col items-start w-full mb-5"}
              >
                {msg?.sender === "user" || msg?.role === "user" ? (
                  // User Message
                  <span className="flex gap-3 h-auto ms-10 lg:me-7 me-2.5">
                    <div>
                      <div className="flex items-center bg-primary text-primary-foreground justify-center px-4 py-3 rounded-lg rounded-tr-sm shadow-sm break-words max-w-[85vw] md:max-w-[60vw]">
                        {renderUserContent(msg?.text)}
                      </div>
                      <p className="text-muted-foreground text-xs mt-1.5 text-right">
                        {msg?.timestamp ? formatTimestamp(msg?.timestamp) : ""}
                      </p>
                    </div>
                  </span>
                ) : (
                  // AI Message
                  <span className="flex gap-2 md:gap-3 lg:ms-6 ms-2">
                    <div className="hidden md:flex w-11 h-11 rounded-lg bg-primary items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary-foreground font-bold text-lg">{isRagMode ? "📄" : PERSONAS.find(p => p.id === selectedPersona).icon}</span>
                    </div>
                    <div className="flex-1 max-w-[90vw] md:max-w-[75vw] lg:max-w-[850px] overflow-hidden">
                      <div className="flex items-start bg-card justify-start px-5 py-3.5 rounded-lg rounded-tl-sm shadow-sm break-words">
                        <div className="text-sm md:text-base text-card-foreground w-full overflow-hidden">
                          {formatMessage(msg?.text)}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1.5">
                        {msg?.timestamp ? formatTimestamp(msg?.timestamp) : ""}
                      </p>
                    </div>
                  </span>
                )}
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start w-full mb-5">
                <span className="flex gap-2 md:gap-3 lg:ms-6 ms-2">
                  <div className="hidden md:flex w-11 h-11 rounded-lg bg-primary items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground font-bold text-lg">{PERSONAS.find(p => p.id === selectedPersona).icon}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-card px-5 py-4 rounded-lg rounded-tl-sm shadow-sm w-fit">
                    <span className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </span>
                  </div>
                </span>
              </div>
            )}

          </div>
        </section>

        {/* Input Area Header Elements */}
        <div className="w-full flex-shrink-0 flex flex-col mt-auto bg-transparent pb-3 lg:pb-0 pt-2 lg:pt-0 z-10">
          {/* Persona Switcher - Show in both modes */}
          <div className="flex gap-2 overflow-x-auto p-2 pb-0 px-3 w-full scrollbar-hide">
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => handlePersonaChange(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${selectedPersona === p.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="w-full px-3 pt-2 pb-0 relative">
              <div className="relative inline-block">
                <img src={imagePreview} className="h-16 rounded-md object-cover border border-border mt-1" />
                <button onClick={cancelImagePreview} className="absolute -top-2 -right-2 bg-red-500/90 hover:bg-red-500 text-white shadow rounded-md p-1 z-10 transition-colors cursor-pointer">
                  <FiX size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-3 w-[100%] pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isRagMode) {
                  if (imageFile) {
                    handleImageInRag();
                  } else if (messageText.trim() && !isRecording) {
                    handleSendMessage();
                  }
                } else {
                  if (imageFile) {
                    sendImage();
                  } else if (!isRecording) {
                    handleSendMessage();
                  }
                }
              }}
              className="flex items-center bg-card h-[50px] w-[100%] px-2 rounded-lg relative shadow-lg "
            >
              {/* File inputs for all types */}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.mp3,.wav" ref={docInputRef} onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0])} className="hidden" />
              <input type="file" accept="image/*" ref={fileInputRef} onChange={isRagMode ? (e) => e.target.files?.[0] && handleUploadFile(e.target.files[0]) : handleImageSelect} className="hidden" />

              {isRagMode ? (
                <>
                  {/* Analysis Mode: + for documents, image for images, mic for audio */}
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-2.5 rounded-md text-muted-foreground hover:bg-muted hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload documents (PDF)"
                  >
                    <FiPlus size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-2.5 rounded-md mx-0.5 text-muted-foreground hover:bg-muted hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload images"
                  >
                    <FiImage size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={isLoading}
                    className={`p-2.5 rounded-md mx-0.5 transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed ${isRecording
                        ? 'text-red-500'
                        : 'text-muted-foreground hover:bg-muted hover:text-primary'
                      }`}
                    title="Record audio"
                  >
                    {isRecording && (
                      <span className="absolute inset-1.5 z-0 rounded-md bg-red-500 opacity-30 animate-ping"></span>
                    )}
                    <FiMic size={20} className="relative z-10" />
                  </button>
                </>
              ) : (
                <>
                  {/* Persona Mode: image and mic icons */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || !conversationId}
                    className="p-2.5 rounded-md mx-0.5 text-muted-foreground hover:bg-muted hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiImage size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={isLoading || !conversationId}
                    className={`p-2.5 rounded-md mx-0.5 transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed ${isRecording
                        ? 'text-red-500'
                        : 'text-muted-foreground hover:bg-muted hover:text-primary'
                      }`}
                  >
                    {isRecording && (
                      <span className="absolute inset-1.5 z-0 rounded-md bg-red-500 opacity-30 animate-ping"></span>
                    )}
                    <FiMic size={20} className="relative z-10" />
                  </button>
                </>
              )}

              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (isRagMode) {
                      if (!isLoading && messageText.trim() !== "" && !imageFile && !isRecording) {
                        handleSendMessage();
                      } else if (!isLoading && imageFile) {
                        handleImageInRag();
                      }
                    } else {
                      if (!isLoading && conversationId && (messageText.trim() !== "" || imageFile)) {
                        if (imageFile) sendImage();
                        else if (!isRecording) handleSendMessage();
                      }
                    }
                  }
                }}
                disabled={isLoading || isRecording || (!isRagMode && !conversationId)}
                type="text"
                className="h-full text-foreground outline-none text-[16px] pl-2 pr-1 rounded-md w-[100%] bg-transparent disabled:opacity-50"
                placeholder={
                  isRagMode
                    ? isLoading ? "Processing..."
                      : isRecording ? "Recording audio..."
                        : imageFile ? "Ask about the image..."
                          : uploadedDocName ? `Ask about "${uploadedDocName}"...`
                            : "Search or ask a question..."
                    : isLoading ? "AI is thinking..."
                      : isRecording ? "Recording audio..."
                        : imageFile ? "Add a question about the image..."
                          : "Message @ChatVerse-AI..."
                }
              />

              <button
                type="submit"
                disabled={
                  isLoading ||
                  isRecording ||
                  (!messageText.trim() && !imageFile) ||
                  (!isRagMode && !conversationId)
                }
                className="bg-primary text-primary-foreground rounded-md p-2.5 mx-0.5 disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <RiLoader4Line size={20} className="animate-spin" />
                ) : (
                  <RiSendPlaneFill size={20} />
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </section>
  );
};

export default AIChatbot;
