import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, KeyRound, ArrowRight } from "lucide-react";
import { motion } from "framer-motion"; 
import Input from "./ui/Input";
import api from "../../api/axios";
import modernInterior from "../../assets/interior1.jpg"; // Keeping the original image import
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

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Login payload:", formData);

      // STEP 1: Fetch role from backend based on email
      const roleResponse = await api.get("/auth/getUserRoleByEmail", {
        params: { email: formData.email },
      });

      if (!roleResponse.data.success) {
        setError("User not found");
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

      console.log("USER FULL OBJECT:", user);
      console.log("USER ROLE:", user.role);

      // Update auth store
      loginStore(user, accessToken, user.role);

      // Navigate to dashboard based on role
      navigate(`/${user.role}`, { replace: true });

    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                {/* GK Logo now uses primary blue color */}
                <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-10 shadow-xl shadow-primary-600/30 transition-transform duration-200 cursor-pointer hover:scale-[1.05] hover:rotate-2">
                  <span className="text-3xl font-extrabold text-white">GK</span>
                </div>
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
            {/* --- Mobile Logo (Linked to Home) --- */}
            <Link to="/" className="lg:hidden inline-block">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-600/30 cursor-pointer">
                <span className="text-2xl font-bold text-white">GK</span>
              </div>
            </Link>

            <motion.h2 variants={itemVariants} className="text-4xl font-extrabold text-slate-900 mb-2">Login to Gharkhoj</motion.h2>
            <motion.p variants={itemVariants} className="text-slate-500 text-lg">Enter your credentials below.</motion.p>
          </div>

          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start gap-3 text-sm overflow-hidden"
            >
              {error}
            </motion.div>
          )}

          <motion.form variants={containerVariants} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="john@example.com"
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
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;