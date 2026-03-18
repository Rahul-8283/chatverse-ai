import { GoogleGenerativeAI } from "@google/generative-ai";

// Verify API key is set
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.error("❌ VITE_GEMINI_API_KEY is not set in .env file!");
}

// Simple rate limiting - just track last request time
let lastRequestTime = 0;
const MIN_DELAY_MS = 2000; // 2 seconds between requests (from Google's recommendation)

const waitBetweenRequests = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_DELAY_MS) {
    const delayNeeded = MIN_DELAY_MS - timeSinceLastRequest;
    console.log(`⏳ Rate limiting: waiting ${Math.ceil(delayNeeded)}ms...`);
    await new Promise(resolve => setTimeout(resolve, delayNeeded));
  }
  
  lastRequestTime = Date.now();
};

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

    // Apply small rate limiting
    await waitBetweenRequests();

    console.log("📡 Calling Gemini API with message:", message.substring(0, 30) + "...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    
    const aiText = response.text();
    console.log("✅ Gemini API response received:", aiText.substring(0, 50) + "...");
    
    return aiText;
  } catch (error) {
    console.error("❌ Gemini API Error:", {
      message: error.message,
      code: error.code
    });
    
    // Check for actual rate limit from API
    if (error.message && error.message.includes("429")) {
      throw new Error("API rate limit from server - please wait before trying again");
    }
    
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
    // Apply rate limiting
    await waitBetweenRequests();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Format messages for context
    const formattedMessages = messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedMessages.slice(0, -1)
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.text);
    
    return result.response.text();
  } catch (error) {
    console.error("❌ Gemini Context Error:", error);
    throw new Error(error.message || "Failed to get AI response");
  }
};