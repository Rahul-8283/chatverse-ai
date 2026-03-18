import React, { useState, useEffect } from "react";
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