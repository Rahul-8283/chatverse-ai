import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { validateEmail, validateFullName, validatePassword, passwordsMatch } from '../utils/validation.js';


const Register = ({isLogin, setIsLogin}) => {
    const [userData, setUserData] = useState({ fullName: "", email: "", password: "", passwordConfirm: "" });
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
        if (!userData?.fullName.trim()) {
            toast.error("Full name is required");
            return;
        }

        if (!validateFullName(userData?.fullName)) {
            toast.error("Full name must be at least 2 characters");
            return;
        }

        if (!userData?.email.trim()) {
            toast.error("Email is required");
            return;
        }
        
        if (!validateEmail(userData?.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (!userData?.password.trim()) {
            toast.error("Password is required");
            return;
        }

        if (!validatePassword(userData?.password)) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (!userData?.passwordConfirm.trim()) {
            toast.error("Please confirm your password");
            return;
        }

        if (!passwordsMatch(userData?.password, userData?.passwordConfirm)) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try{
            // Create user with Firebase Auth - this will throw error if email already exists
            const userCredential = await createUserWithEmailAndPassword(auth, userData?.email, userData?.password);
            const user = userCredential.user;

            // Save user profile to Firestore
            const userDocRef = doc(db, "users", user.uid);

            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                username: user.email?.split("@")[0],
                fullName: userData.fullName,
                image: "",
            });

            toast.success("Account created successfully! 🎉 Welcome to ChatVerse");
            setUserData({ fullName: "", email: "", password: "", passwordConfirm: "" });
        }
        catch(error){
            console.log(error);
            if (error.code === "auth/email-already-in-use") {
                toast.warning("This email is already registered. Please login instead");
            } else if (error.code === "auth/weak-password") {
                toast.error("Password is too weak. Please use a stronger password");
            } else if (error.code === "auth/invalid-email") {
                toast.error("Invalid email format");
            } else {
                toast.error(error.message || "Registration failed. Please try again");
            }
        }
        finally{
            setIsLoading(false);
        }
    }

    return (
        <section className="flex flex-col justify-center items-center h-[100vh] background-image">
            <div className="bg-white shadow-lg p-5 rounded-xl h-[27rem] w-[20rem] flex flex-col justify-center items-center">
                <div className="mb-10">
                    <h1 className="text-center text-[28px] font-bold">Sign Up</h1>
                    <p className="text-center text-sm text-gray-400">Welcome, create an account to continue</p>
                </div>
                <div className="w-full">
                    <input type="text" name="fullName" onChange={handleChangeUserData} value={userData.fullName} className="border border-green-200 w-full p-2 rounded-md bg-[#01aa851d] text-[#004939f3] mb-3 font-medium outline-none placeholder:text-[#00493958]" placeholder="Full Name" />
                    <input type="email" name="email" onChange={handleChangeUserData} value={userData.email} className="border border-green-200 w-full p-2 rounded-md bg-[#01aa851d] text-[#004939f3] mb-3 font-medium outline-none placeholder:text-[#00493958]" placeholder="Email" />
                    <input type="password" name="password" onChange={handleChangeUserData} value={userData.password} className="border border-green-200 w-full p-2 rounded-md bg-[#01aa851d] text-[#004939f3] mb-3 font-medium outline-none placeholder:text-[#00493958]" placeholder="Password" />
                    <input type="password" name="passwordConfirm" onChange={handleChangeUserData} value={userData.passwordConfirm} className="border border-green-200 w-full p-2 rounded-md bg-[#01aa851d] text-[#004939f3] mb-3 font-medium outline-none placeholder:text-[#00493958]" placeholder="Confirm Password" />
                </div>
                <div className="w-full">
                    <button disabled={isLoading} onClick={handleAuth} className="bg-[#01aa85] text-white font-bold w-full p-2 rounded-md flex items-center gap-2 justify-center">
                        {isLoading ? (
                            <>
                                <>Registering....</>
                            </>
                        ) : (
                            <>
                                Register <FaUserPlus />
                            </>
                        )}
                    </button>
                </div>
                <div className="mt-5 text-center text-gray-400 text-sm">
                    <button onClick={() => setIsLogin(!isLogin)}>Already have an account? Sign In</button>
                </div>
            </div>
        </section>
    );
};

export default Register;
