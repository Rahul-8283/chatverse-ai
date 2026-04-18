import React, { useState } from "react";
import { FaSignInAlt } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { auth, googleProvider, db } from '../firebase/firebase.ts';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { validateEmail } from '../utils/validation.ts';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { motion } from "framer-motion";

const Login = ({ isLogin, setIsLogin }) => {
    const { theme, toggleTheme } = useTheme();
    const [userData, setUserData] = useState({ email: "", password: "" });
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
        }
        catch (error) {
            console.error(error);  // ✅ Changed from console.log to console.error
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
            console.error(error);  // ✅ Changed from console.log to console.error
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
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card shadow-2xl p-7 sm:p-9 rounded-3xl w-[90%] max-w-[400px] flex flex-col justify-center items-center border border-border/50 relative z-10"
            >
                <div className="mb-7 w-full flex flex-col items-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                        <FaSignInAlt className="text-primary text-[22px] translate-x-[0px]" />
                    </div>
                    <h1 className="text-center text-[26px] font-extrabold text-foreground tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-center text-sm text-muted-foreground">Sign in to continue to ChatVerse</p>
                </div>

                <div className="w-full mb-7 space-y-3.5">
                    <div className="relative">
                        <input type="email" name="email" value={userData.email} onChange={handleChangeUserData} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementsByName('password')[0]?.focus(); } }} className="w-full p-3.5 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 shadow-sm" placeholder="Email Address" />
                    </div>
                    <div className="relative">
                        <input type="password" name="password" value={userData.password} onChange={handleChangeUserData} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAuth(); } }} className="w-full p-3.5 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 shadow-sm" placeholder="Password" />
                    </div>
                </div>

                <div className="w-full mb-6">
                    <button disabled={isLoading} onClick={handleAuth} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[17px] w-full py-3.5 rounded-xl flex items-center gap-2 justify-center shadow-[0_4px_14px_0_rgba(1,170,133,0.39)] hover:shadow-[0_6px_20px_rgba(1,170,133,0.23)] hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none">
                        {isLoading ? (
                            <>Logging in...</>
                        ) : (
                            <>Sign In</>
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
                    <button onClick={() => setIsLogin(!isLogin)} className="hover:text-primary transition-colors font-medium">Don't have an account yet? <span className="text-primary font-bold">Sign Up</span></button>
                </div>
            </motion.div>
        </section>
    );
};

export default Login;