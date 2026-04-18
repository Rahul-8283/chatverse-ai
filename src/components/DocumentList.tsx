import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { FiTrash2, FiFileText, FiImage, FiMusic, FiRefreshCw } from 'react-icons/fi';
import { BiSolidFilePdf } from 'react-icons/bi';
import { RiMore2Fill } from 'react-icons/ri';
import useApiStore from '../store/useApiStore.ts';
import HelpModal from './HelpModal.tsx';
import { auth, db } from '../firebase/firebase.ts';
import { onSnapshot, doc } from 'firebase/firestore';
import default1 from "../assets/default1.jpg";

const DocumentList = () => {
  const { documents, isLoading, isDeleting, fetchDocuments, deleteDocument, deleteAllDocuments } = useApiStore();
  const [user, setUser] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Fetch user data
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUser(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  // Load documents on mount
  useEffect(() => {
    if (!auth.currentUser) return;  // ✅ Auth check - prevent crash on logout
    
    fetchDocuments().catch((error) => {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    });
  }, []);  // ✅ Removed fetchDocuments from deps - prevent infinite loop

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <BiSolidFilePdf className="text-red-500" size={20} />;
    if (fileType.includes('image')) return <FiImage className="text-blue-500" size={20} />;
    if (fileType.includes('audio')) return <FiMusic className="text-green-500" size={20} />;
    return <FiFileText className="text-gray-500" size={20} />;
  };

  // Get file type display
  const getFileTypeDisplay = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('image/jpeg')) return 'JPG';
    if (fileType.includes('image/png')) return 'PNG';
    if (fileType.includes('image/gif')) return 'GIF';
    if (fileType.includes('image/webp')) return 'WEBP';
    if (fileType.includes('audio/mpeg')) return 'MP3';
    if (fileType.includes('audio/wav')) return 'WAV';
    return 'File';
  };

  const handleDeleteDocument = async (docId: string, docName: string) => {
    try {
      await deleteDocument(docId);
      toast.success(`"${docName}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleDeleteAllDocuments = async () => {
    if (documents.length === 0) return;

    const confirmed = window.confirm(
      `Delete all ${documents.length} document(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteAllDocuments();
      toast.success('All documents deleted successfully');
    } catch (error) {
      console.error('Error deleting all documents:', error);
      toast.error('Failed to delete all documents');
    }
  };

  const sortedDocuments = useMemo(() => {
    return [...(documents || [])].sort((a, b) => {
      const aTime = new Date(a.uploadedAt).getTime();
      const bTime = new Date(b.uploadedAt).getTime();
      return bTime - aTime;
    });
  }, [documents]);

  return (
    <section className="relative hidden lg:flex flex-col item-start justify-start bg-card border-r border-border h-[100vh] w-[100%] md:w-[580px]">
      <header className="flex items-center justify-between w-[100%] lg:border-b border-border p-4 sticky md:static top-0 z-[100] border-r">
        <main className="flex items-center gap-3">
          <img src={user?.image || default1} className="w-[44px] h-[44px] object-cover rounded-full" alt="temp" />
          <span>
            <h3 className="p-0 font-semibold text-foreground md:text-[17px]">{user?.fullName || "ChatVerse User"}</h3>
            <p className="p-0 font-light text-muted-foreground text-[15px]">@{user?.username || "chatverse"}</p>
          </span>
        </main>
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="bg-muted w-[35px] h-[35px] flex items-center justify-center rounded-lg hover:bg-muted/80 transition-colors">
          <RiMore2Fill className="w-[28px] h-[28px] cursor-pointer text-primary" />
        </button>
      </header>

      <div className='w-[100%] mt-[10px] px-5 '>
        <header className='flex items-center justify-between  '>
          <h3 className='text-[16px]'>Documents ({documents?.length || 0})</h3>
          <div className='flex items-center gap-2'>
            {documents.length > 0 && (
              <button
                onClick={handleDeleteAllDocuments}
                disabled={isLoading}
                className="text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2 py-1 rounded transition-colors disabled:opacity-50"
                title="Delete all documents"
              >
                Delete All
              </button>
            )}
            <button
              onClick={() => fetchDocuments()}
              disabled={isLoading}
              className="bg-muted w-[35px] h-[35px] p-2 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
              title="Refresh documents"
            >
              <FiRefreshCw size={18} className={`text-primary ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>
      </div>

      <main className='flex flex-col items-start mt-[1.5rem] flex-1 overflow-y-auto w-full'>
        {isLoading && documents.length === 0 ? (
          <div className="w-full flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center">
            <FiFileText size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No documents uploaded yet</p>
            <p className="text-muted-foreground text-xs mt-1">Upload documents to get started</p>
          </div>
        ) : (
          sortedDocuments.map((doc) => (
            <button
              key={doc.id}
              className="flex items-start justify-between w-[100%] border-b border-border px-5 py-3 hover:bg-muted transition group"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-1">
                  {getFileIcon(doc.type)}
                </div>
                <span className="min-w-0 flex-1">
                  <h2 className="p-0 font-semibold text-foreground text-left text-[17px] truncate">
                    {doc.name}
                  </h2>
                  <p className="p-0 font-light text-muted-foreground text-left text-[14px]">
                    {getFileTypeDisplay(doc.type)}
                  </p>
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDocument(doc.id, doc.name);
                }}
                disabled={isDeleting[doc.id]}
                className="flex-shrink-0 ml-2 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                title="Delete document"
              >
                {isDeleting[doc.id] ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiTrash2 size={18} />
                )}
              </button>
            </button>
          ))
        )}

      {isHelpOpen && (
        <HelpModal onClose={() => setIsHelpOpen(false)} />
      )}
      </main>
    </section>
  );
};

export default DocumentList;
