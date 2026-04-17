import { create } from 'zustand';
import api from '../config/axiosConfig';
import { auth } from '../firebase/firebase';

export const useApiStore = create<any>((set) => ({
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
  },

  uploadDocument: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/api/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${idToken}`
        }
      });

      set({ isLoading: false });
      return res;
    } catch (error: any) {
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  ragChat: async (message: string) => {
    set({ isLoading: true, error: null });
    try {
      const idToken = await auth.currentUser?.getIdToken();

      const res = await api.post('/api/rag-chat', {
        query: message,
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      set({ isLoading: false });
      return res.data.response;
    } catch (error: any) {
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  }
}));

export default useApiStore;
