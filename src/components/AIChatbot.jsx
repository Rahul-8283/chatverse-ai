import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { RiSendPlaneFill, RiLoader4Line } from "react-icons/ri";
import { chatWithAI } from '../utils/geminiAPI';
import { saveAIMessage, listenForAIMessages } from '../firebase/firebase';
import formatTimestamp from '../utils/formatTimestamp';
import { auth } from '../firebase/firebase';
import default1 from "../assets/default1.jpg";

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Generate or get conversation ID on component mount 
  useEffect(() => {
    // Use today's date as conversation ID so all messages in a day are grouped
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    setConversationId(today);
  }, []);

  // Listen to Firestore messages when conversation ID is set
  useEffect(() => {
    if (!conversationId || !auth.currentUser) return;

    // Listen for messages from Firestore
    unsubscribeRef.current = listenForAIMessages(
      auth.currentUser.uid,
      conversationId,
      setMessages
    );

    // Cleanup listener on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Sort messages by timestamp
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const aTime = a?.timestamp?.seconds || 0;
      const bTime = b?.timestamp?.seconds || 0;
      return aTime - bTime;
    });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      toast.error("Please type a message");
      return;
    }

    if (!conversationId || !auth.currentUser) {
      toast.error("Error: Cannot send message. Please refresh and try again.");
      return;
    }

    const userMessageText = messageText;
    setMessageText("");
    setIsLoading(true);

    try {
      // Save user message to Firestore
      await saveAIMessage(
        auth.currentUser.uid,
        conversationId,
        userMessageText,
        "user"
      );

      // Get AI response
      const aiResponse = await chatWithAI(userMessageText);

      // Save AI message to Firestore
      await saveAIMessage(
        auth.currentUser.uid,
        conversationId,
        aiResponse,
        "ai"
      );

    } catch (error) {
      console.error("Error in chat:", error);
      
      // More specific error messages
      const errorMsg = error?.message ? String(error.message) : String(error);
      
      if (errorMsg.includes("429") || errorMsg.includes("rate limit from server")) {
        toast.error("⏱️ Server rate limit reached. Please wait 30 seconds.");
      } else if (errorMsg.includes("API key")) {
        toast.error("❌ Invalid Gemini API key. Check .env file.");
      } else if (errorMsg.includes("permission") || errorMsg.includes("PERMISSION")) {
        toast.error("❌ Permission denied. Check Firestore rules.");
      } else {
        toast.error(`Error: ${errorMsg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='flex flex-col items-start justify-start h-screen w-[100%] background-image'>
      {/* Chat Header */}
      <header className='border-b border-border w-[100%] h-[70px] md:h-fit p-4 bg-card '>
        <main className='flex items-center gap-3 '>
          <span>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🤖</span>
            </div>
          </span>
          <span>
            <h3 className="font-semibold text-foreground text-lg">ChatVerse AI</h3>
            <p className="font-light text-muted-foreground text-sm">@chatverse-ai</p>
          </span>
        </main>
      </header>

      {/* Chat Messages Area */}
      <main className="custom-scrollbar relative h-[100vh] w-[100%] flex flex-col justify-between ">
        <section className="px-3 pt-5 pb-20 lg:pb-10 ">
          <div ref={scrollRef} className="overflow-auto h-[80vh]">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to ChatVerse AI</h2>
                <p className="text-muted-foreground mb-4">Ask me anything and I'll help you out!</p>
                <div className="text-sm text-muted-foreground">
                  <p>✨ Ask questions</p>
                  <p>💡 Get suggestions</p>
                  <p>📚 Learn something new</p>
                </div>
              </div>
            )}

            {/* Messages */}
            {sortedMessages?.map((msg, index) => (
              <div
                key={index}
                className={msg?.sender === "user" ? "flex flex-col items-end w-full mb-5" : "flex flex-col items-start w-full mb-5"}
              >
                {msg?.sender === "user" ? (
                  // User Message
                  <span className="flex gap-3 h-auto ms-10 lg:me-7 me-2.5">
                    <div>
                      <div className="flex items-center bg-primary text-primary-foreground justify-center p-4 rounded-lg shadow-sm break-words">
                        <h4 className="text-sm md:text-base">{msg?.text}</h4>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1.5 text-right">
                        {msg?.timestamp ? formatTimestamp(msg?.timestamp) : ""}
                      </p>
                    </div>
                  </span>
                ) : (
                  // AI Message
                  <span className="flex gap-3 w-[40%] h-auto lg:ms-6 ms-2">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">🤖</span>
                    </div>
                    <div>
                      <div className="flex items-start bg-card justify-start p-4 rounded-lg shadow-sm break-words">
                        <p className="text-sm md:text-base text-card-foreground">
                          {msg?.text}
                        </p>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1.5">
                        {msg?.timestamp ? formatTimestamp(msg?.timestamp) : ""}
                      </p>
                    </div>
                  </span>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 w-full lg:ms-6 ms-2 mb-5">
                <img
                  src={default1}
                  className="h-11 w-11 object-cover rounded-full"
                  alt="AI Bot"
                />
                <div className="flex items-center gap-2 bg-card p-4 rounded-lg shadow-sm">
                  <RiLoader4Line className="animate-spin text-primary" size={20} />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Message Input */}
        <div className="sticky lg:bottom-0 bottom-[60px] p-3 h-fit w-[100%] ">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center bg-card h-[45px] w-[100%] px-2 rounded-lg relative shadow-lg "
          >
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={isLoading || !conversationId}
              type="text"
              className="h-full text-foreground outline-none text-[16px] pl-3 pr-[40px] rounded-lg w-[100%] bg-transparent disabled:opacity-50"
              placeholder={isLoading ? "AI is thinking..." : "Ask me anything..."}
            />
            <button
              type="submit"
              disabled={isLoading || !conversationId}
              className="flex items-center justify-center absolute right-3 p-2 rounded-md bg-muted hover:brightness-95 disabled:opacity-50"
            >
              {isLoading ? (
                <RiLoader4Line className="animate-spin text-primary" />
              ) : (
                <RiSendPlaneFill className="text-primary" />
              )}
            </button>
          </form>
        </div>
      </main>
    </section>
  );
};

export default AIChatbot;
