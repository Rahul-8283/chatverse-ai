import { create } from 'zustand';
import api from '../config/axiosConfig';
import { auth } from '../firebase/firebase';

export const useApiStore = create<any>((set) => ({
  isLoading: false,
  error: null,
  documents: [],
  isDeleting: {},

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
      formData.append("file", audioBlob, "voice.wav");
      
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
      return res;
    } catch (error: any) {
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await api.get('/api/documents', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      set({ documents: res.data.documents || [], isLoading: false });
      return res.data.documents;
    } catch (error: any) {
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  deleteDocument: async (docId: string) => {
    set((state: any) => ({
      isDeleting: { ...state.isDeleting, [docId]: true }
    }));

    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await api.delete(`/api/documents/${docId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      set((state: any) => ({
        documents: state.documents.filter((doc: any) => doc.id !== docId),
        isDeleting: { ...state.isDeleting, [docId]: false }
      }));

      return res.data;
    } catch (error: any) {
      set((state: any) => ({
        isDeleting: { ...state.isDeleting, [docId]: false },
        error: error?.response?.data?.detail || error.message
      }));
      throw error;
    }
  },

  deleteAllDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await api.delete('/api/documents/delete-all', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      set({ documents: [], isLoading: false });
      return res.data;
    } catch (error: any) {
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  deleteChat: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("User not authenticated");
      }
      
      if (!conversationId) {
        throw new Error("Conversation ID not provided");
      }
      
      console.log(`🗑️ Attempting to delete conversation: ${conversationId}`);
      const res = await api.delete(`/api/chat/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      set({ isLoading: false });
      console.log(`✅ Successfully deleted conversation: ${conversationId}`);
      return res.data;
    } catch (error: any) {
      console.error(`❌ Error deleting chat:`, error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to delete chat";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  }
}));

export default useApiStore;
