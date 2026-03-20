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
        <section className="flex flex-col justify-center items-center h-[100vh] background-image relative">
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]"></div>
            <div className="bg-card shadow-2xl p-8 sm:p-10 rounded-3xl w-[90%] max-w-[450px] flex flex-col justify-center items-center border border-border/50 relative z-10 my-4">
                <div className="mb-8 w-full flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 border border-primary/20 shadow-inner">
                        <FaUserPlus className="text-primary text-2xl ml-1" />
                    </div>
                    <h1 className="text-center text-3xl font-extrabold text-foreground tracking-tight mb-2">Create Account</h1>
                    <p className="text-center text-sm text-muted-foreground">Sign up to get started with ChatVerse</p>
                </div>
                
                <div className="w-full mb-8 space-y-4">
                    <div className="relative">
                        <input type="text" name="fullName" onChange={handleChangeUserData} value={userData.fullName} className="w-full p-4 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 shadow-sm" placeholder="Full Name" />
                    </div>
                    <div className="relative">
                        <input type="email" name="email" onChange={handleChangeUserData} value={userData.email} className="w-full p-4 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 shadow-sm" placeholder="Email Address" />
                    </div>
                    <div className="relative">
                        <input type="password" name="password" onChange={handleChangeUserData} value={userData.password} className="w-full p-4 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 shadow-sm" placeholder="Password" />
                    </div>
                    <div className="relative">
                        <input type="password" name="passwordConfirm" onChange={handleChangeUserData} value={userData.passwordConfirm} className="w-full p-4 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 shadow-sm" placeholder="Confirm Password" />
                    </div>
                </div>

                <div className="w-full mb-6">
                    <button disabled={isLoading} onClick={handleAuth} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg w-full py-4 rounded-xl flex items-center gap-2 justify-center shadow-[0_4px_14px_0_rgba(1,170,133,0.39)] hover:shadow-[0_6px_20px_rgba(1,170,133,0.23)] hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none">
                        {isLoading ? (
                            <>Registering...</>
                        ) : (
                            <>Create Account</>
                        )}
                    </button>
                </div>
                
                <div className="mt-2 text-center text-muted-foreground text-sm">
                    <button onClick={() => setIsLogin(!isLogin)} className="hover:text-primary transition-colors font-medium">Already have an account? <span className="text-primary font-bold">Sign In</span></button>
                </div>
            </div>
        </section>
    );
};

export default Register;
