import { signInWithPopup, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "../util/firebase.js";
import { generateGuestId } from "../util/utils.js";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function Login({ setLoggedIn, setShowLogin, setUserId, setHasAccount }) {
    // Check if user has previously had an account to default to login mode
    const hasExistingAccount = localStorage.getItem('hasUserAccount') === 'true';
    const [isSignUp, setIsSignUp] = useState(!hasExistingAccount);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Check for redirect result on mount (for Google sign-in fallback)
    useEffect(() => {
        const checkRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    const uid = result.user.uid;
                    localStorage.setItem("loginState", JSON.stringify({ loggedIn: true, timestamp: Date.now(), userId: uid }));
                    localStorage.setItem("hasUserAccount", "true");
                    setHasAccount(true);
                    setUserId(uid);
                    setLoggedIn(true);
                    setShowLogin(false);
                }
            } catch (error) {
                console.error("Redirect result error:", error);
            }
        };
        checkRedirectResult();
    }, [setLoggedIn, setShowLogin, setUserId, setHasAccount]);

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError("");
            const result = await signInWithPopup(auth, googleProvider);
            const uid = result.user.uid;
            localStorage.setItem("loginState", JSON.stringify({ loggedIn: true, timestamp: Date.now(), userId: uid }));
            localStorage.setItem("hasUserAccount", "true");
            setHasAccount(true);
            setUserId(uid);
            setLoggedIn(true);
            setShowLogin(false);
        } catch (error) {
            // If popup is blocked or COOP error, fall back to redirect
            if (error.code === 'auth/popup-blocked' ||
                error.code === 'auth/popup-closed-by-user' ||
                error.message?.includes('Cross-Origin-Opener-Policy')) {
                try {
                    await signInWithRedirect(auth, googleProvider);
                } catch (redirectError) {
                    setError("Failed to sign in with Google. Please try again.");
                }
            } else {
                setError("Failed to sign in with Google. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = () => {
        const guestId = generateGuestId();
        localStorage.setItem("loginState", JSON.stringify({ loggedIn: true, timestamp: Date.now(), userId: guestId }));
        setUserId(guestId);
        setLoggedIn(true);
        setShowLogin(false);
    };

    const handleEmailLogin = async () => {
        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const result = await signInWithEmailAndPassword(auth, email, password);
            const uid = result.user.uid;
            localStorage.setItem("loginState", JSON.stringify({ loggedIn: true, timestamp: Date.now(), userId: uid }));
            localStorage.setItem("hasUserAccount", "true");
            setHasAccount(true);
            setUserId(uid);
            setLoggedIn(true);
            setShowLogin(false);
        } catch (error) {
            switch (error.code) {
                case 'auth/user-not-found':
                    setError("No account found with this email address");
                    break;
                case 'auth/wrong-password':
                    setError("Incorrect password");
                    break;
                case 'auth/invalid-email':
                    setError("Invalid email address");
                    break;
                case 'auth/too-many-requests':
                    setError("Too many failed login attempts. Please try again later");
                    break;
                default:
                    setError("Failed to sign in. Please try again");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const uid = result.user.uid;
            localStorage.setItem("loginState", JSON.stringify({ loggedIn: true, timestamp: Date.now(), userId: uid }));
            localStorage.setItem("hasUserAccount", "true");
            setHasAccount(true);
            setUserId(uid);
            setLoggedIn(true);
            setShowLogin(false);
        } catch (error) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError("An account with this email already exists");
                    break;
                case 'auth/invalid-email':
                    setError("Invalid email address");
                    break;
                case 'auth/weak-password':
                    setError("Password is too weak. Please choose a stronger password");
                    break;
                default:
                    setError("Failed to create account. Please try again");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email address first");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // Action code settings for the reset link
            const actionCodeSettings = {
                // URL to redirect to after password reset (your app's URL)
                url: window.location.origin,
                handleCodeInApp: false,
            };

            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            setShowSuccessModal(true);
            setShowForgotPassword(false);
        } catch (error) {
            console.error("Password Reset Error:", error.code, error.message, error);
            switch (error.code) {
                case 'auth/user-not-found':
                    setError("No account found with this email address");
                    break;
                case 'auth/invalid-email':
                    setError("Invalid email address");
                    break;
                case 'auth/missing-email':
                    setError("Please enter an email address");
                    break;
                case 'auth/too-many-requests':
                    setError("Too many requests. Please wait a moment and try again");
                    break;
                case 'auth/network-request-failed':
                    setError("Network error. Please check your internet connection");
                    break;
                case 'auth/invalid-credential':
                    // Firebase sometimes throws this even for password reset
                    setError("Unable to send reset email. Please verify your email address");
                    break;
                case 'auth/operation-not-allowed':
                    setError("Password reset is not enabled. Please contact support.");
                    break;
                default:
                    setError(`Failed to send reset email: ${error.code || error.message || 'Unknown error'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !loading) {
            if (isSignUp) {
                handleSignUp();
            } else {
                handleEmailLogin();
            }
        }
    };

    return (
        <div className="flex h-screen bg-linear-to-r from-purple-50 to-indigo-100 overflow-hidden">
            {/* Close button */}
            <button
                onClick={() => setShowLogin(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200 hover:scale-105"
                aria-label="Close login"
            >
                <X size={24} className="text-gray-600" />
            </button>

            {/* Left side - Illustration - Hidden on mobile */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    <img src="/logo.svg" alt="Brain Illustration" className="w-48 h-48 mb-6 drop-shadow-lg" />
                    <h1 className="text-3xl sm:text-5xl md:text-[58px] font-display font-bold text-purple-600 flex justify-center items-center gap-2">
                        DocDynamo
                    </h1>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-5">AI-Powered Document Intelligence</h2>
                    <p className="text-gray-600 text-center max-w-md">
                        Transform your documents into intelligent insights with DocDynamo's advanced AI capabilities
                    </p>
                </div>
                {/* Background circles */}
                <div className="absolute top-20 left-20 w-20 h-20 bg-purple-200 rounded-full opacity-40 animate-pulse"></div>
                <div className="absolute bottom-32 right-16 w-16 h-16 bg-indigo-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-10 w-12 h-12 bg-purple-400 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Right side - Login form - Full width on mobile */}
            <div className="flex-1 w-full flex items-center justify-center relative overflow-y-auto bg-gradient-to-br from-purple-600 to-indigo-700 py-8 px-4">
                {/* Background decorative elements */}
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full transform translate-x-32 translate-y-32"></div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-20 -translate-y-20"></div>
                <div className="absolute top-1/2 right-10 w-32 h-32 bg-purple-400 opacity-10 rounded-full hidden sm:block"></div>

                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 w-full max-w-md z-10 my-auto">
                    {/* Mobile header with logo */}
                    <div className="lg:hidden text-center mb-4 sm:mb-6">
                        <img src="/logo.svg" alt="DocDynamo" className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2" />
                        <h1 className="text-xl sm:text-2xl font-bold text-purple-600">DocDynamo</h1>
                        <p className="text-xs sm:text-sm text-gray-600">AI-Powered Document Intelligence</p>
                    </div>

                    <div className="text-center mb-4 sm:mb-6">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1">Hello!</h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            {isSignUp ? "Sign Up to Get Started" : "Welcome Back!"}
                        </p>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                onKeyDown={handleKeyDown}
                                className="w-full px-4 py-2.5 sm:py-3 pl-11 sm:pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                disabled={loading}
                            />
                            <svg className="absolute left-3.5 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                            </svg>
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                onKeyDown={handleKeyDown}
                                className="w-full px-4 py-2.5 sm:py-3 pl-11 sm:pl-12 pr-11 sm:pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                disabled={loading}
                            />
                            <svg className="absolute left-3.5 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                )}
                            </button>
                        </div>

                        <button
                            onClick={isSignUp ? handleSignUp : handleEmailLogin}
                            disabled={loading}
                            className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
                        >
                            {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Login")}
                        </button>

                        <div className="relative my-1">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-xs sm:text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full cursor-pointer bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-gray-100 text-sm sm:text-base"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {loading ? "Please wait..." : "Continue with Google"}
                        </button>

                        <button
                            onClick={handleGuestLogin}
                            disabled={loading}
                            className="w-full cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 text-sm sm:text-base"
                        >
                            Continue as Guest
                        </button>

                        <div className="text-center space-y-1 sm:space-y-2 pt-1">
                            <button
                                onClick={() => {
                                    setError("");
                                    setShowForgotPassword(true);
                                }}
                                className="text-purple-600 hover:text-purple-700 hover:underline text-xs sm:text-sm block w-full transition-colors cursor-pointer"
                            >
                                Forgot Password?
                            </button>
                            <p className="text-gray-600 text-xs sm:text-sm">
                                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                                <button
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors cursor-pointer"
                                >
                                    {isSignUp ? "Login" : "Sign Up"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForgotPassword(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
                                <p className="text-gray-600 text-sm">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError("");
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !loading && email) {
                                                handleForgotPassword();
                                            }
                                        }}
                                        className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        disabled={loading}
                                        autoFocus
                                    />
                                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                                    </svg>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowForgotPassword(false);
                                            setError("");
                                        }}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition duration-200"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleForgotPassword}
                                        disabled={loading || !email}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Sending..." : "Send Reset Link"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Sent!</h2>
                            <p className="text-gray-600 mb-2">
                                We've sent a password reset link to:
                            </p>
                            <p className="text-blue-600 font-semibold mb-6">
                                {email}
                            </p>
                            <p className="text-gray-500 text-sm mb-6">
                                Check your inbox and click the link to reset your password. The link will expire in 1 hour.
                            </p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
