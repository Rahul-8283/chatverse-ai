import { create } from 'zustand';
import api from '../config/axiosConfig';

export const useApiStore = create((set) => ({
  isLoading: false,
  error: null,

  sendChat: async ({ message, history, persona }) => {
    set({ isLoading: true, error: null });
    try{
      const res = await api.post("/api/chat", { message, history, persona });
      set({ isLoading: false });
      return res;
    } 
    catch(error){
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  sendImageScan: async (file, prompt = "Analyze and describe this image in detail.") => {
    set({ isLoading: true, error: null });
    try{
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", prompt);
      
      const res = await api.post("/api/image-scan", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      set({ isLoading: false });
      return res;
    } 
    catch(error){
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  sendVoice: async (audioBlob) => {
    set({ isLoading: true, error: null });
    try{
      const formData = new FormData();
      formData.append("file", audioBlob, "voice.webm");
      
      const res = await api.post("/api/voice", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      set({ isLoading: false });
      return res;
    } 
    catch(error){
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  }
}));

export default useApiStore;
