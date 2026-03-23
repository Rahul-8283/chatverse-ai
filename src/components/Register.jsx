import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../firebase/firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { validateEmail, validateFullName, validatePassword, passwordsMatch } from '../utils/validation.js';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { RiMoonLine, RiSunLine } from "react-icons/ri";


const Register = ({ isLogin, setIsLogin }) => {
    const { theme, toggleTheme } = useTheme();
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
        try {
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

            setUserData({ fullName: "", email: "", password: "", passwordConfirm: "" });
        }
        catch (error) {
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
        finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    username: user.email?.split("@")[0],
                    fullName: user.displayName || "Google User",
                    image: user.photoURL || "",
                });
            }
        } catch (error) {
            console.log(error);
            toast.error("Google sign-in failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="flex flex-col justify-center items-center h-[100vh] background-image relative">
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-card border border-border text-foreground shadow-md hover:bg-muted transition-colors"
                title="Toggle Theme"
            >
                {theme === 'dark' ? <RiSunLine size={22} /> : <RiMoonLine size={22} />}
            </button>
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]"></div>
            <div className="bg-card shadow-2xl p-7 sm:p-9 rounded-3xl w-[90%] max-w-[425px] flex flex-col justify-center items-center border border-border/50 relative z-10 my-4">
                <div className="mb-7 w-full flex flex-col items-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                        <FaUserPlus className="text-primary text-[22px] translate-x-[2px]" />
                    </div>
                    <h1 className="text-center text-[26px] font-extrabold text-foreground tracking-tight mb-2">Create Account</h1>
                    <p className="text-center text-sm text-muted-foreground">Sign up to get started with ChatVerse</p>
                </div>

                <div className="w-full mb-7 space-y-3.5">
                    <div className="relative">
                        <input type="text" name="fullName" onChange={handleChangeUserData} value={userData.fullName} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementsByName('email')[0]?.focus(); } }} className="w-full p-3.5 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 shadow-sm" placeholder="Full Name" />
                    </div>
                    <div className="relative">
                        <input type="email" name="email" onChange={handleChangeUserData} value={userData.email} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementsByName('password')[0]?.focus(); } }} className="w-full p-3.5 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 shadow-sm" placeholder="Email Address" />
                    </div>
                    <div className="relative">
                        <input type="password" name="password" onChange={handleChangeUserData} value={userData.password} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementsByName('passwordConfirm')[0]?.focus(); } }} className="w-full p-3.5 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 shadow-sm" placeholder="Password" />
                    </div>
                    <div className="relative">
                        <input type="password" name="passwordConfirm" onChange={handleChangeUserData} value={userData.passwordConfirm} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAuth(); } }} className="w-full p-3.5 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 shadow-sm" placeholder="Confirm Password" />
                    </div>
                </div>

                <div className="w-full mb-6">
                    <button disabled={isLoading} onClick={handleAuth} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[17px] w-full py-3.5 rounded-xl flex items-center gap-2 justify-center shadow-[0_4px_14px_0_rgba(1,170,133,0.39)] hover:shadow-[0_6px_20px_rgba(1,170,133,0.23)] hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none">
                        {isLoading ? (
                            <>Registering...</>
                        ) : (
                            <>Create Account</>
                        )}
                    </button>

                    <div className="flex items-center my-5">
                        <div className="flex-1 h-[1px] bg-border/60"></div>
                        <span className="px-3 text-muted-foreground text-sm font-medium">OR</span>
                        <div className="flex-1 h-[1px] bg-border/60"></div>
                    </div>

                    <button 
                        disabled={isLoading} 
                        onClick={handleGoogleAuth} 
                        className="w-full py-3 rounded-xl border border-border bg-card/50 hover:bg-muted focus:ring-2 focus:ring-primary/20 flex items-center justify-center gap-3 transition-all font-semibold shadow-sm text-foreground disabled:opacity-70 disabled:hover:bg-card/50"
                    >
                        <FcGoogle className="text-[22px]" />
                        <span>Continue with Google</span>
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
