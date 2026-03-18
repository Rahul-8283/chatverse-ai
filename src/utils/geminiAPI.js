import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Chat with Gemini AI
 * @param {string} message - User message
 * @returns {Promise<string>} AI response
 */
export const chatWithAI = async (message) => {
  try {
    if (!message.trim()) {
      throw new Error("Message cannot be empty");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to get AI response");
  }
};

/**
 * Get conversation context for multi-turn conversations
 * @param {array} messages - Array of previous messages
 * @returns {Promise<string>} AI response with context
 */
export const chatWithContext = async (messages) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Format messages for context
    const formattedMessages = messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedMessages.slice(0, -1), // All messages except last
    });

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.text);
    
    return result.response.text();
  } catch (error) {
    console.error("Gemini Context Error:", error);
    throw new Error(error.message || "Failed to get AI response");
  }
};