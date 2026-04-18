<div align="center">
  <img src="src/assets/logo.png" alt="ChatVerse Logo" width="150" />
  <h1>ChatVerse AI</h1>
  <p>A next-generation, deeply-integrated AI ecosystem featuring RAG, native voice interpretation, multimodal vision, and real-time P2P synchronization.</p>

  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  
  **[View Live Demo](https://chatverse-ai-chat.vercel.app/)**
</div>

## 🌟 Overview
**ChatVerse AI** is an advanced AI-driven communication platform that bridges the gap between traditional real-time chat and intelligent LLM interactions. It features a sophisticated **RAG (Retrieval-Augmented Generation)** pipeline, allowing the AI to "remember" and reason over your uploaded documents, images, and audio files.

With a dark-minimalist UI built on React 19 and Tailwind CSS v4, ChatVerse AI delegating complex AI orchestrations to a secured FastAPI backend, ensuring high performance and data security.

---

## 🏗️ Architecture & Workflow

The system follows a modern decoupled architecture:
- **Frontend:** React 19 SPA for real-time interaction and asset management.
- **Backend:** FastAPI server handling LLM orchestration (Gemini & Groq), RAG processing, and file extraction.
- **AI Memory (RAG):** Pinecone (Vector DB) for semantic search and Supabase for persistent file storage.
- **Real-time Engine:** Firebase Firestore for instant P2P messaging and authentication.

<img width="100%" alt="Architecture Flow" src="../Eraser_FlowDiagram.png" />

---

## ✨ Key Features

### 🧠 Retrieval-Augmented Generation (RAG)
- **AI Memory:** Upload PDFs, images, or audio files. The system extracts text, generates embeddings via Gemini, and stores them in **Pinecone**.
- **Context-Aware Chat:** Toggle RAG mode to ask questions specifically about your uploaded data. The AI retrieves relevant "chunks" to provide grounded, accurate answers.
- **Document Manager:** Full CRUD support for your AI memory—upload, list, and delete indexed documents.

### 🤖 Intelligent AI Assistant
- **Dynamic Personas:** Switch between multiple AI personalities (Professional Assistant, Tutor, Therapist, Roast Bot).
- **Multimodal Intelligence:** 
  - **Vision:** Upload images for native analysis by Gemini Pro Vision.
  - **Voice:** Record and send voice memos; the backend transcribes and processes them as AI prompts.
- **LLM Fallback:** Resilient architecture that tries **Google Gemini** first and falls back to **Groq (Llama-3)** for uninterrupted service.

### 👥 Global P2P Chat
- **Real-Time Sync:** Messaging powered by Firebase Firestore with zero-latency snapshot listeners.
- **Visual Excellence:** Sleek dark-mode interface with Framer Motion animations and custom minimalist chat bubbles.

---

## 🛠️ Full Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Framer Motion |
| **Backend** | FastAPI (Python), Uvicorn, Python-Dotenv |
| **AI Models** | Google Gemini 2.5 Flash, Groq (Llama-3), Gemini Embeddings |
| **Data & Auth** | Firebase (Auth & Firestore), Firebase Admin SDK |
| **Storage & Search** | Pinecone (Vector Database), Supabase (Object Storage), Cloudinary (Image Hosting) |
| **Processing** | PyPDF2, pdfplumber, SpeechRecognition, RecordRTC |

---

## 🚀 Getting Started

### 1. Prerequisite
- Node.js (v18+)
- Python (3.11+)
- API Keys for: Firebase, Google Gemini, Groq, Pinecone, Supabase, and Cloudinary.

### 2. Installation

**Frontend Setup:**
```bash
cd chatverse-ai
npm install
```

**Backend Setup:**
```bash
cd chatverse-ai-backend
pip install -r requirements.txt
```

### 3. Environment Configuration

**Frontend (`chatverse-ai/.env`):**
```dotenv
VITE_FIREBASE_API_KEY="..."
VITE_CLOUDINARY_CLOUD_NAME="..."
VITE_CLOUDINARY_UPLOAD_PRESET="..."
VITE_BACKEND_URL_DEV=http://127.0.0.1:8000
VITE_BACKEND_URL_PROD="your_deployed_backend_url"
```

**Backend (`chatverse-ai-backend/.env`):**
```dotenv
GEMINI_API_KEY="..."
GROQ_API_KEY="..."
PINECONE_API_KEY="..."
PINECONE_INDEX_NAME="..."
SUPABASE_URL="..."
SUPABASE_SECRET_KEY="..."
# Firebase Admin Credentials
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."
```


### 4. Running Locally

1. Start the Backend: `uvicorn main:app --reload`
2. Start the Frontend: `npm run dev`

---

## 🔗 Project Links
- **Frontend Repository:** [ChatVerse AI Frontend](https://github.com/Rahul-8283/chatverse-ai)
- **Backend Repository:** [ChatVerse AI Backend](https://github.com/Rahul-8283/chatverse-ai-backend)

---
<p align="center">Built with ❤️ for the next generation of AI communication.</p>