<div align="center">
  <img src="src/assets/logo.png" alt="ChatVerse Logo" width="150" />
  <h1>ChatVerse AI</h1>
  <p>A modern, real-time chat application with integrated AI assistance.</p>

  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
  
  **[View Live Demo](https://chatverse-ai-chat.vercel.app/)**
</div>

## 🌟 Overview

**ChatVerse AI** is a fully functional, real-time chat application designed to provide a seamless messaging experience. Not only can you connect and chat with other users, but you can also interact with an intelligent **AI Assistant** powered by Google Gemini. The application features a sleek, responsive UI built with Tailwind CSS and ensures secure authentication and data synchronization through Firebase.

---

## ✨ Key Features

- **🔐 Secure Authentication:** User sign-up, login, and robust session management via Firebase Auth.
- **💬 Real-Time Messaging:** Instant message delivery and real-time updates using Firebase Firestore.
- **🤖 Integrated AI Assistant:** Built-in AI Chatbot powered by the `@google/generative-ai` SDK (Gemini) for smart, automated conversations.
- **🎨 Modern & Responsive UI:** Beautiful, intuitive, and mobile-friendly design utilizing Tailwind CSS.
- **⚡ Blazing Fast Performance:** Powered by React 19 and Vite for an optimized and snappy user experience.
- **🔔 Toast Notifications:** Elegant alerts and notifications for user actions and errors.

---

## 🛠️ Tech Stack

- **Frontend Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend/BaaS:** [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **AI Integration:** [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)
- **Icons & Alerts:** `react-icons`, `react-toastify`

---

## 🚀 Getting Started

Follow these instructions to set up the project on your local machine.

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine.
- **Firebase Account**: Create a project on the [Firebase Console](https://console.firebase.google.com/).
- **Gemini API Key**: Obtain an API key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/chatverse-ai.git
   cd chatverse-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase and Gemini credentials:

   ```env
   VITE_FIREBASE_API_KEY="your_firebase_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
   VITE_FIREBASE_APP_ID="your_firebase_app_id"
   VITE_GEMINI_API_KEY="your_gemini_api_key"
   ```
   *(Note: Adjust the variable names according to how they are referenced in your `src/firebase/firebase.js` file.)*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:5173` to view the application.

---

## 📄 License

This project is licensed under the MIT License.
