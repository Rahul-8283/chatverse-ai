import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Navlinks from "./components/Navlinks";
import Chatbox from "./components/Chatbox";
import Chatlist from "./components/Chatlist";
import { auth, db } from "./firebase/firebase.js";

const App = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
        }

        const unsubsribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => unsubsribe();
    }, []);

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
                    <Chatbox selectedUser={selectedUser} />
                </div>
            ) : (
                <div className=" ">
                    {isLogin ? ( <Login isLogin={isLogin} setIsLogin={setIsLogin} /> ) : ( <Register isLogin={isLogin} setIsLogin={setIsLogin} />) };
                </div>
            )}
        </div>
    );
};

export default App;