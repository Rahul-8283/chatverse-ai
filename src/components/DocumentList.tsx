import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import api from '../config/axiosConfig';
import { toast } from 'react-toastify';
import { FiTrash2, FiFileText, FiImage, FiMusic } from 'react-icons/fi';
import { AiOutlineFile } from 'react-icons/ai';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <AiOutlineFile className="text-red-500" size={20} />;
    if (fileType.includes('image')) return <FiImage className="text-blue-500" size={20} />;
    if (fileType.includes('audio')) return <FiMusic className="text-green-500" size={20} />;
    return <FiFileText className="text-gray-500" size={20} />;
  };

  // Get file type display
  const getFileTypeDisplay = (fileType) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('image/jpeg')) return 'JPG';
    if (fileType.includes('image/png')) return 'PNG';
    if (fileType.includes('audio/mpeg')) return 'MP3';
    if (fileType.includes('audio/wav')) return 'WAV';
    return 'File';
  };

  // Fetch documents
  const fetchDocuments = async () => {
    if (!auth.currentUser) return;

    setIsLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await api.get('/api/documents', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete single document
  const deleteDocument = async (docId, docName) => {
    if (!auth.currentUser) return;

    setIsDeleting(prev => ({ ...prev, [docId]: true }));
    try {
      const idToken = await auth.currentUser.getIdToken();
      await api.delete(`/api/documents/${docId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      toast.success(`"${docName}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setIsDeleting(prev => ({ ...prev, [docId]: false }));
    }
  };

  // Delete all documents
  const deleteAllDocuments = async () => {
    if (!auth.currentUser || documents.length === 0) return;

    const confirmed = window.confirm(`Delete all ${documents.length} document(s)? This cannot be undone.`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      await api.delete('/api/documents/delete-all', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      setDocuments([]);
      toast.success('All documents deleted successfully');
    } catch (error) {
      console.error('Error deleting all documents:', error);
      toast.error('Failed to delete all documents');
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <section className="flex flex-col h-[100vh] w-full lg:w-80 border-r border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Documents</h2>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
            {documents.length}
          </span>
        </div>

        {/* Delete All Button */}
        {documents.length > 0 && (
          <button
            onClick={deleteAllDocuments}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors disabled:opacity-50"
          >
            🗑️ Delete All
          </button>
        )}
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && documents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <FiFileText size={40} className="text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground text-sm">No documents uploaded yet</p>
            <p className="text-muted-foreground text-xs mt-1">Upload documents to get started</p>
          </div>
        ) : (
          <ul className="space-y-1 p-2">
            {documents.map(doc => (
              <li
                key={doc.id}
                className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(doc.type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getFileTypeDisplay(doc.type)}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteDocument(doc.id, doc.name)}
                  disabled={isDeleting[doc.id]}
                  className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  title="Delete document"
                >
                  {isDeleting[doc.id] ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiTrash2 size={18} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-border text-xs text-muted-foreground text-center">
        {documents.length > 0 && (
          <button
            onClick={fetchDocuments}
            disabled={isLoading}
            className="w-full py-1 hover:text-foreground transition-colors"
          >
            🔄 Refresh
          </button>
        )}
      </div>
    </section>
  );
};

export default DocumentList;
