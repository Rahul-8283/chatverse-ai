import { create } from 'zustand';
import api from '../config/axiosConfig.ts';
import { auth } from '../firebase/firebase.ts';

// ✅ Type definitions for API responses
interface ChatMessage {
  role: string;
  parts: Array<{ text: string }>;
}

interface ChatResponse {
  data: {
    response: string;
  };
}

interface ImageScanResponse {
  data: {
    response: string;
  };
}

interface VoiceResponse {
  data: {
    transcript: string;
  };
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size?: number;
}

interface DocumentsResponse {
  data: {
    documents: Document[];
  };
}

interface UploadResponse {
  data: {
    success: boolean;
    message: string;
  };
}

interface DeleteResponse {
  data: {
    success: boolean;
    message: string;
  };
}

// ✅ Type definitions for API parameters
interface ChatParams {
  message: string;
  history: ChatMessage[];
  persona: string;
}

interface RagChatParams {
  query: string;
}

// ✅ Define the entire Zustand store state interface
interface ApiStore {
  // State
  isLoading: boolean;
  error: string | null;
  documents: Document[];
  isDeleting: Record<string, boolean>;

  // Methods
  sendChat: (params: ChatParams) => Promise<ChatResponse>;
  sendImageScan: (file: File, prompt?: string) => Promise<ImageScanResponse>;
  sendVoice: (audioBlob: Blob) => Promise<VoiceResponse>;
  uploadDocument: (file: File) => Promise<UploadResponse>;
  ragChat: (message: string) => Promise<ChatResponse>;
  fetchDocuments: () => Promise<Document[]>;
  deleteDocument: (docId: string) => Promise<DeleteResponse>;
  deleteAllDocuments: () => Promise<DeleteResponse>;
  deleteChat: (conversationId: string) => Promise<DeleteResponse>;
}

export const useApiStore = create<ApiStore>((set) => ({
  isLoading: false,
  error: null,
  documents: [],
  isDeleting: {},

  sendChat: async ({ message, history, persona }: ChatParams): Promise<ChatResponse> => {
    set({ isLoading: true, error: null });
    try{
      const res = await api.post("/api/chat", { message, history, persona });
      set({ isLoading: false });
      return res as ChatResponse;
    } 
    catch(error: any){
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  sendImageScan: async (file: File, prompt: string = "Analyze and describe this image in detail."): Promise<ImageScanResponse> => {
    set({ isLoading: true, error: null });
    try{
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", prompt);
      
      const res = await api.post("/api/image-scan", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      set({ isLoading: false });
      return res as ImageScanResponse;
    } 
    catch(error: any){
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  sendVoice: async (audioBlob: Blob): Promise<VoiceResponse> => {
    set({ isLoading: true, error: null });
    try{
      const formData = new FormData();
      formData.append("file", audioBlob, "voice.wav");
      
      const res = await api.post("/api/voice", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      set({ isLoading: false });
      return res as VoiceResponse;
    } 
    catch(error: any){
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  uploadDocument: async (file: File): Promise<UploadResponse> => {
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
      return res as UploadResponse;
    } catch (error: any) {
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  ragChat: async (message: string): Promise<ChatResponse> => {
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
      return res as ChatResponse;
    } catch (error: any) {
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  fetchDocuments: async (): Promise<Document[]> => {
    set({ isLoading: true, error: null });
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await api.get('/api/documents', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      const documents = res.data.documents || [];
      set({ documents, isLoading: false });
      return documents;
    } catch (error: any) {
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  deleteDocument: async (docId: string): Promise<DeleteResponse> => {
    set((state: ApiStore) => ({
      isDeleting: { ...state.isDeleting, [docId]: true }
    }));

    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await api.delete(`/api/documents/${docId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      set((state: ApiStore) => ({
        documents: state.documents.filter((doc: Document) => doc.id !== docId),
        isDeleting: { ...state.isDeleting, [docId]: false }
      }));

      return res as DeleteResponse;
    } catch (error: any) {
      set((state: ApiStore) => ({
        isDeleting: { ...state.isDeleting, [docId]: false },
        error: error?.response?.data?.detail || error.message
      }));
      throw error;
    }
  },

  deleteAllDocuments: async (): Promise<DeleteResponse> => {
    set({ isLoading: true, error: null });
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await api.delete('/api/documents/delete-all', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      set({ documents: [], isLoading: false });
      return res as DeleteResponse;
    } catch (error: any) {
      set({ isLoading: false, error: error?.response?.data?.detail || error.message });
      throw error;
    }
  },

  deleteChat: async (conversationId: string): Promise<DeleteResponse> => {
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
      return res as DeleteResponse;
    } catch (error: any) {
      console.error(`❌ Error deleting chat:`, error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to delete chat";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  }
}));

export default useApiStore;
