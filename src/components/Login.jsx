import React, { useState } from "react";
import { FaSignInAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { auth } from '../firebase/firebase.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { validateEmail } from '../utils/validation.js';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { RiMoonLine, RiSunLine } from "react-icons/ri";

const Login = ({isLogin, setIsLogin}) => {
    const { theme, toggleTheme } = useTheme();
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
        <section className="flex flex-col justify-center items-center h-[100vh] background-image relative">
            <button 
                onClick={toggleTheme} 
                className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-card border border-border text-foreground shadow-md hover:bg-muted transition-colors"
                title="Toggle Theme"
            >
                {theme === 'dark' ? <RiSunLine size={22} /> : <RiMoonLine size={22} />}
            </button>
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]"></div>
            <div className="bg-card shadow-2xl p-7 sm:p-9 rounded-3xl w-[90%] max-w-[400px] flex flex-col justify-center items-center border border-border/50 relative z-10">
                <div className="mb-7 w-full flex flex-col items-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                        <FaSignInAlt className="text-primary text-[22px] ml-1" />
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
                </div>

                <div className="mt-2 text-center text-muted-foreground text-sm">
                    <button onClick={() => setIsLogin(!isLogin)} className="hover:text-primary transition-colors font-medium">Don't have an account yet? <span className="text-primary font-bold">Sign Up</span></button>
                </div>
            </div>
        </section>
    );
};

export default Login;
