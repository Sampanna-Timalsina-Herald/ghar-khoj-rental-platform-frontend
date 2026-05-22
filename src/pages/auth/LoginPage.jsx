import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, KeyRound, ArrowRight } from "lucide-react";
import { motion } from "framer-motion"; 
import { toast } from "sonner";
import Input from "./ui/Input";
import api from "../../api/axios";
import modernInterior from "../../assets/interior1.jpg";
import gharkhojLogo from "../../assets/GHARKHOJ_LOGO.png";
import { useAuthStore } from "../../stores/authStore";

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.7, ease: "easeOut", type: "spring", damping: 12 } 
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: "easeInOut" } },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpResending, setOtpResending] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpInputRefs = useRef([]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // STEP 1: Fetch role from backend based on email
      const roleResponse = await api.get("/auth/getUserRoleByEmail", {
        params: { email: formData.email },
      });

      if (!roleResponse.data.success) {
        toast.error("User not found");
        setLoading(false);
        return;
      }

    const role = roleResponse.data.role;
      // STEP 2: Login
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        role,
      });

      const { user, accessToken } = response.data;

      console.log("✅ LOGIN RESPONSE RECEIVED");
      console.log("USER FULL OBJECT:", user);
      console.log("USER ROLE:", user.role);
      console.log("ACCESS TOKEN RECEIVED:", accessToken ? accessToken.substring(0, 30) + '...' : 'NO TOKEN');
      console.log("ACCESS TOKEN FULL LENGTH:", accessToken?.length);
      console.log("ACCESS TOKEN STARTS WITH 'Bearer'?:", accessToken?.startsWith('Bearer'));
      
      // Check cookies
      console.log("🍪 COOKIES:", document.cookie);

      // Update auth store
      console.log("📝 Updating auth store...");
      loginStore(user, accessToken, user.role);
      
      // Verify token was saved to localStorage
      const savedToken = localStorage.getItem('token');
      const savedRole = localStorage.getItem('role');
      const savedUser = localStorage.getItem('user');
      
      console.log("✅ VERIFICATION AFTER LOGIN:");
      console.log("- Token saved:", savedToken ? savedToken.substring(0, 30) + '...' : 'FAILED TO SAVE');
      console.log("- Token length:", savedToken?.length);
      console.log("- Token starts with Bearer?:", savedToken?.startsWith('Bearer'));
      console.log("- Role saved:", savedRole);
      console.log("- User saved:", savedUser ? 'YES' : 'NO');
      console.log("- Cookies after login:", document.cookie);
      
      // Test if token works by making a simple API call
      if (user.role === 'tenant') {
        console.log("🧪 TESTING TOKEN - Making test API call...");
        try {
          // Import api here to avoid circular dependency
          const { default: api } = await import('../../api/axios');
          const testResponse = await api.get('/auth/me');
          console.log("✅ TEST API CALL SUCCESS:", testResponse.data);
        } catch (testError) {
          console.error("❌ TEST API CALL FAILED:", testError.response?.data || testError.message);
          console.error("❌ This means the token is not working!");
        }
      }
      
      // For tenant, add extra delay to see what happens
      if (user.role === 'tenant') {
        console.log("⏰ TENANT LOGIN - Waiting 2 seconds before navigation...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("⏰ TENANT LOGIN - Proceeding with navigation...");
        console.log("⏰ TENANT LOGIN - Final check - Token still there?", !!localStorage.getItem('token'));
      }

      // Navigate to dashboard based on role
      console.log("🚀 Navigating to:", `/${user.role}`);
      navigate(`/${user.role}`, { replace: true });

    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      const errorData = err.response?.data || {};
      
      // If user exists but email is not verified, show OTP verification
      if (errorData.requiresOTPVerification && errorData.email) {
        setShowOTPVerification(true);
        setOtpTimer(60);
        return;
      }
      
      toast.error(errorData.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setOtpResending(true);
    try {
      await api.post('/auth/resend-otp', { email: formData.email });
      setOtpTimer(60);
      setOtp(['', '', '', '', '', '']);
      toast.success("OTP sent successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setOtpResending(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.warning('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', { 
        email: formData.email, 
        otp: otpString 
      });

      const { user, accessToken, autoLogin } = response.data;

      if (autoLogin && user) {
        // Auto-login after verification
        loginStore(user, accessToken, user.role);
        toast.success("Login successful!");
        navigate(`/${user.role}`, { replace: true });
      } else {
        // Manual login required
        setShowOTPVerification(false);
        // Trigger login again
        setTimeout(() => {
          handleSubmit(e);
        }, 100);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  // OTP Timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  return (
    <div className="min-h-screen w-full flex bg-gray-50 overflow-hidden">

      {/* 🌟 Left Aesthetic Branding Section (Image + Light Overlay) */}
      <motion.div 
        initial={{ x: "-100%" }}
        animate={{ x: "0%" }}
        transition={{ duration: 0.8, ease: [0.6, 0.01, -0.05, 0.9] }} // Custom spring/ease for unique motion
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white/50"
      >
        <motion.div 
          variants={imageVariants} 
          initial="hidden" 
          animate="visible"
          className="absolute inset-0 z-0"
        >
          <img
            src={modernInterior}
            alt="Modern interior"
            className="w-full h-full object-cover opacity-80"
          />
          {/* Light, subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
        </motion.div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full text-slate-900">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* --- Desktop Logo (Linked to Home) --- */}
            <motion.div variants={itemVariants}>
              <Link to="/" className="inline-block">
                <img 
                  src={gharkhojLogo} 
                  alt="Gharkhoj Logo" 
                  className="h-20 w-auto mb-10 transition-transform duration-200 cursor-pointer hover:scale-105"
                />
              </Link>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
              Welcome Back<br />
              <motion.span 
                 initial={{ color: "#3b82f6" }} // Initial blue
                 animate={{ color: ["#3b82f6", "#f59e0b", "#3b82f6"] }} // Animating colors
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="inline-block"
              >
                to Gharkhoj.
              </motion.span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-slate-700 max-w-md leading-relaxed">
              Sign in to access verified listings, secure chats, and personalized recommendations.
            </motion.p>
          </motion.div>

          {/* Animated Footer Quote */}
          <motion.div 
            initial={{ opacity: 0, y: 20, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="bg-primary-600/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-600/30 shadow-lg"
          >
            <p className="text-slate-700 italic text-base">
              "A smooth and secure way to find your next home or tenant!"
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* 🌟 Right Form Section (Highly Animated) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative">
        {/* Subtle radial gradient accent */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-30 pointer-events-none mix-blend-multiply"></div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md z-10"
        >
          <div className="mb-10">
            <Link to="/" className="lg:hidden inline-block">
              <img 
                src={gharkhojLogo} 
                alt="Gharkhoj Logo" 
                className="h-14 w-auto mb-6 cursor-pointer"
              />
            </Link>

            <motion.h2 variants={itemVariants} className="text-4xl font-extrabold text-slate-900 mb-2">Login to Gharkhoj</motion.h2>
            <motion.p variants={itemVariants} className="text-slate-500 text-lg">Enter your credentials below.</motion.p>
          </div>

          {showOTPVerification ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h3>
                <p className="text-slate-600">Enter the 6-digit code sent to <strong>{formData.email}</strong></p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex gap-3 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => otpInputRefs.current[index] = el}
                      type="text"
                      className={`w-12 h-14 text-center text-2xl font-mono font-bold rounded-lg bg-gray-50 text-gray-900 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                        digit ? 'border-primary-500' : ''
                      }`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      maxLength="1"
                      inputMode="numeric"
                      disabled={loading}
                    />
                  ))}
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-500">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={otpTimer > 0 || otpResending || loading}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:text-gray-400 transition-colors disabled:cursor-not-allowed"
                  >
                    {otpResending ? 'Sending...' : otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend Code'}
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Login'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOTPVerification(false);
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="w-full text-sm text-slate-500 hover:text-slate-700"
                >
                  ← Back to Login
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.form variants={containerVariants} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail size={18} />}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={<KeyRound size={18} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-primary-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              
              {/* --- Forgot Password Link --- */}
              <motion.div initial={{ x: 10 }} animate={{ x: 0 }} transition={{ delay: 0.5 }} className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </motion.div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(37, 99, 235, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4 text-lg"
            >
              {loading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <>
                  Secure Login
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </motion.form>
          )}
          {!showOTPVerification && (
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-slate-500 text-base">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-600 font-bold hover:text-primary-700 hover:underline underline-offset-4 decoration-2"
              >
                Register here
              </Link>
            </p>
          </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;