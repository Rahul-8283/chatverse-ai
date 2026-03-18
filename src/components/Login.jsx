import React, { useState } from "react";
import { FaSignInAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { auth } from '../firebase/firebase.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { validateEmail } from '../utils/validation.js';

const Login = ({isLogin, setIsLogin}) => {
    const [userData, setUserData] = useState({email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleChangeUserData = (e) => {
        const { name, value } = e.target;

        setUserData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAuth = async () => {
        // Validation checks
        if (!userData?.email.trim()) {
            toast.error("Email is required");
            return;
        }

        if (!userData?.password.trim()) {
            toast.error("Password is required");
            return;
        }

        if (!validateEmail(userData?.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, userData?.email, userData?.password);
            toast.success("Login successful! Welcome back 👋");
        }
        catch(error){
            console.log(error);
            if (error.code === "auth/user-not-found") {
                toast.error("No account found with this email");
            } else if (error.code === "auth/wrong-password") {
                toast.error("Incorrect password. Please try again");
            } else if (error.code === "auth/invalid-email") {
                toast.error("Invalid email format");
            } else {
                toast.error(error.message || "Login failed. Please try again");
            }
        }
        finally{
            setIsLoading(false);
        }
    };

    return (
        <section className="flex flex-col justify-center items-center h-[100vh] background-image">
            <div className="bg-white shadow-lg p-5 rounded-xl h-[27rem] w-[20rem] flex flex-col justify-center items-center">
                <div className="mb-14">
                    <h1 className="text-center text-[28px] font-bold">Sign In</h1>
                    <p className="text-center text-sm text-gray-400">Welcome back, login to continue</p>
                </div>
                <div className="w-full mb-7">
                    <input type="email" name="email" value={userData.email} onChange={handleChangeUserData} className="border border-green-200 w-full p-2 rounded-md bg-[#01aa851d] text-[#004939f3] mb-3 font-medium outline-none placeholder:text-[#00493958]" placeholder="Email" />
                    <input type="password" name="password" value={userData.password} onChange={handleChangeUserData} className="border border-green-200 w-full p-2 rounded-md bg-[#01aa851d] text-[#004939f3] mb-3 font-medium outline-none placeholder:text-[#00493958]" placeholder="Password" />
                </div>
                <div className="w-full">
                    <button disabled={isLoading} onClick={handleAuth} className="bg-[#01aa85] text-white font-bold w-full p-2 rounded-md flex items-center gap-2 justify-center">
                        {isLoading ? (
                            <>
                                <>Loggin in....</>
                            </>
                        ) : (
                            <>
                                Login <FaSignInAlt />
                            </>
                        )}
                    </button>
                </div>
                <div className="mt-5 text-center text-gray-400 text-sm">
                    <button onClick={() => setIsLogin(!isLogin)} >Don't have an account yet? Sign Up</button>
                </div>
            </div>
        </section>
    );
};

export default Login;
