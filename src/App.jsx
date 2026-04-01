import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Navlinks from "./components/Navlinks";
import Chatbox from "./components/Chatbox";
import Chatlist from "./components/Chatlist";
import AIChatbot from "./components/AIChatbot";
import SplashScreen from "./components/SplashScreen";
import { auth, db, initializeAIBot } from "./firebase/firebase.js";
import logo from "./assets/logo.png";

const App = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
            // Initialize AI Bot when user is authenticated
            initializeAIBot();
        }

        const unsubsribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            if (user) {
                // Initialize AI Bot when user logs in
                initializeAIBot();
            }
        });

        return () => unsubsribe();
    }, []);

    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <div>
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {user ? (
                <div className="flex flex-col lg:flex-row items-start width-[100%]">
                    <Navlinks />
                    <Chatlist setSelectedUser={setSelectedUser} />
                    {/* Routing Logic: Show AIChatbot or Chatbox based on selectedUser */}
                    {selectedUser ? (
                        selectedUser?.uid === "ai-assistant-bot" ? (
                            <AIChatbot />
                        ) : (
                            <Chatbox selectedUser={selectedUser} />
                        )
                    ) : (
                        <section className='min-h-screen w-[100%] bg-background text-foreground'>
                            <div className='flex flex-col justify-center items-center min-h-screen px-4 py-8'>
                                <img src={logo} alt="ChatVerse Logo" width={100} className="mb-5" />
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mt-5 mb-3 text-center">Welcome to ChatVerse</h1>
                                <p className="text-muted-foreground text-sm sm:text-base text-center max-w-md mb-8">Select a chat to get started or chat with our AI assistant</p>
                                
                                {/* Mobile Only Warning */}
                                <div className="lg:hidden bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-lg p-4 max-w-md text-center">
                                    <p className="text-xs sm:text-sm text-green-900 dark:text-green-100">
                                        💻 <span className="font-semibold">Best Experience on Desktop</span><br />
                                        This app is optimized for larger screens (PC, Laptop). For the best experience, please switch to a desktop device.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="bg-background text-foreground h-screen">
                    {isLogin ? ( <Login isLogin={isLogin} setIsLogin={setIsLogin} /> ) : ( <Register isLogin={isLogin} setIsLogin={setIsLogin} />) };
                </div>
            )}
        </div>
    );
};

export default App;