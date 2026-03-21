<div align="center">
  <img src="src/assets/logo.png" alt="ChatVerse Logo" width="150" />
  <h1>ChatVerse AI</h1>
  <p>A next-generation, deeply-integrated AI communication platform featuring native voice interpretation, multimodal vision, and real-time synchronization.</p>

  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

  [![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)   
  
  **[View Live Demo](https://chatverse-ai-chat.vercel.app/)**
</div>

## 🌟 Overview
**ChatVerse AI** is not just a chat application—it is a secure, decoupled AI ecosystem. It provides users with a beautifully streamlined, dark-minimalist UI that handles complex multimodal asset streaming organically. The frontend parses raw audio recordings and high-resolution images, synchronizing state with Firebase Firestore instantly, while securely delegating all Generative AI (Gemini 2.5 Flash) orchestrations to its dedicated FastAPI backend layer via Axios.

🔗 **[View the required Backend API Repository here](https://github.com/Rahul-8283/chatverse-ai-backend)**

## 🏗️ Architecture & Workflow Diagram

<img width="1961" height="902" alt="Eraser_FlowDiagram" src="https://github.com/user-attachments/assets/aa6dfc4e-308f-4a88-9290-f2476ac371bb" />

---

## ✨ Features

### 👥 Global Person-to-Person Chat
- **Real-Time Messaging:** Instantly chat with other users connected to the application with zero delay.
- **Persistent Message Sync:** Powered by Firebase Firestore Snapshot Listeners, all conversations sync live across all your active devices.
- **Micro-Animations:** Beautiful chat bubbles, smooth message bounding, and sleek visual toast notifications when receiving messages.

### 🤖 Intelligent AI Assistant
- **Dynamic AI Personas:** Seamlessly switch between chatting with a Professional Assistant, a study-oriented Tutor, a Therapist, or a playful Roast Bot.
- **Voice Memos & Audio:** Record live audio messages via a custom built player. The system parses your voice and prompts the AI!
- **Image Intelligence (Vision):** Send images directly to the bot and ask questions about them—the AI breaks down exactly what's inside the photo natively.

---

## 🛠️ Full Technology Stack
- **Frontend Framework:** [React 19](https://react.dev/)
- **Build Engine:** [Vite](https://vitejs.dev/)
- **Design System:** [Tailwind CSS v4](https://tailwindcss.com/) (Custom minimalist dark-mode configuration)
- **API Orchestration:** Axios (Handling dynamic environment switching based on execution context)
- **Realtime Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore Snapshot Listeners)
- **UI Assets:** `react-icons`, `react-toastify`

---

## 🚀 Getting Started

**1. Clone & Install**
```bash
git clone https://github.com/Rahul-8283/chatverse-ai.git
cd chatverse-ai
npm install
```

**2. Configure Environment (`.env`)**
Create a `.env` file at the project root folder. 
*(Note: To maintain high security, AI API Keys are completely stripped from the frontend and exclusively belong to the backend routing server. Only Firebase config and Backend URLs are required here.)*

```dotenv
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"

VITE_APP_MODE=development
VITE_BACKEND_URL_DEV=http://127.0.0.1:8000
VITE_BACKEND_URL_PROD="backend_url"
```

**3. Run the Development Environment:**
```bash
npm run dev
```
