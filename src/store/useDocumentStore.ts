import { create } from 'zustand';
import api from '../config/axiosConfig';
import { auth } from '../firebase/firebase';

export const useDocumentStore = create<any>((set) => ({
  documents: [],
  isLoading: false,
  isDeleting: {},
  error: null,

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
  }
}));
