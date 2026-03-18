import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const chatWithAI = async (message) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(message);
  return result.response.text();
};