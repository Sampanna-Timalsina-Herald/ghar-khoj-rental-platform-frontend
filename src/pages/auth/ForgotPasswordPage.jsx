import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Input from "./ui/Input";
import api from "../../api/axios";
import modernInterior from "../../assets/interior1.jpg"; // Reusing the same image for consistency

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // To toggle success view
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API Call to trigger password reset email
      // Adjust the endpoint if your backend path is different
      await api.post("/auth/forgot-password", { email });
      
      setIsSubmitted(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 z-0">
          <img
            src={modernInterior}
            alt="Modern interior"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full text-white">
          <div>
            <Link to="/" className="inline-block">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-primary-600/30 hover:scale-105 transition-transform duration-200 cursor-pointer">
                <span className="text-2xl font-bold text-white">GK</span>
              </div>
            </Link>
            <h1 className="text-5xl font-display font-bold leading-tight mb-6">
              Forgot your<br />
              <span className="text-primary-400">Password?</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              Don't worry, it happens to the best of us. We'll help you recover your account in no time.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50 pointer-events-none mix-blend-multiply lg:hidden"></div>

        <div className="w-full max-w-md z-10 animate-fade-in">
          
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden inline-block">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-600/30">
              <span className="text-2xl font-bold text-white">GK</span>
            </div>
          </Link>

          {!isSubmitted ? (
            // --- VIEW 1: Input Form ---
            <>
              <div className="mb-8">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors"
                >
                  <ArrowLeft size={16} className="mr-2" /> Back to Login
                </Link>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h2>
                <p className="text-slate-500">
                  Enter the email associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-sm animate-slide-up">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-600/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            // --- VIEW 2: Success State ---
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Check your mail</h2>
              <p className="text-slate-500 mb-8">
                We have sent a password recover instructions to your email.
              </p>
              
              <div className="space-y-4">
                <button
                   onClick={() => window.open('https://gmail.com', '_blank')}
                   className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-600/20 transition-all duration-200"
                >
                  Open Email App
                </button>
                
                <p className="text-sm text-slate-500">
                  Did not receive the email? Check your spam filter, or <button onClick={() => setIsSubmitted(false)} className="text-primary-600 font-semibold hover:underline">try another email address</button>.
                </p>

                <div className="pt-4">
                    <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;