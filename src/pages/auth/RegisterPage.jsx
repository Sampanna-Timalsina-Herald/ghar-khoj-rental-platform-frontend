import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import modernInterior from '../../assets/interior1.jpg'; 
import gharkhojLogo from '../../assets/GHARKHOJ_LOGO.png';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  Building2, 
  ArrowRight,
  Lock,
  MailCheck,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import Input from './ui/Input';
import api from '../../api/axios';

import { validatePasswordStrength, getPasswordStrengthMessage } from '../../utils/password-validator'; 

const UserRole = {
  TENANT: "tenant",
  LANDLORD: "landlord"
};

// --- Framer Motion Variants (matching LoginPage) ---
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
const PasswordFeedback = ({ password }) => {
    if (!password) return null;

    const validationResult = validatePasswordStrength(password);
    const { strength, requirements, score } = validationResult;

    // Helper to determine the bar color based on score/strength
    const getBarColor = (s) => {
        if (s <= 1) return 'bg-red-500';
        if (s === 2) return 'bg-orange-400';
        if (s === 3) return 'bg-yellow-500';
        if (s >= 4) return 'bg-green-500';
        return 'bg-gray-200';
    };
    
    // Width is based on score out of 5 checks
    const barWidth = `${(score / 5) * 100}%`;
    const barColor = getBarColor(score);
    const textColor = getBarColor(score).replace('bg-', 'text-');

    return (
        <div className="mt-2 text-xs">
            {/* Strength Bar */}
            <div className="flex items-center gap-2 mb-2">
                <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-300 ${barColor}`} 
                        style={{ width: barWidth }}
                    />
                </div>
                <span className={`font-semibold ${textColor}`}>{strength}</span>
            </div>

            {/* Detailed Requirements List */}
            <ul className="grid grid-cols-2 gap-y-1 text-slate-600">
                {requirements.map((req, index) => (
                    <li key={index} className="flex items-center">
                        {req.passed ? (
                            <CheckCircle2 size={12} className="text-green-500 mr-1.5 flex-shrink-0" />
                        ) : (
                            <X size={12} className="text-red-500 mr-1.5 flex-shrink-0" />
                        )}
                        {req.message}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ------------------------------------------------------------------
// --- PASSWORD MATCH FEEDBACK COMPONENT (Helper) ---
// ------------------------------------------------------------------
const PasswordMatchFeedback = ({ password, confirmPassword }) => {
    if (!password || !confirmPassword) return null;

    const isMatch = password === confirmPassword;

    return (
        <div className="mt-2 text-xs">
            <div className="flex items-center gap-2">
                {isMatch ? (
                    <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                ) : (
                    <X size={14} className="text-red-500 flex-shrink-0" />
                )}
                <span className={isMatch ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {isMatch ? '✓ Passwords Match' : '✗ Passwords Don\'t Match'}
                </span>
            </div>
        </div>
    );
};


const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // OTP Verification State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]); // Ref for OTP focus management
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0); // Timer for resend
  
  // Messages and Redirection Control
  const [successMessage, setSuccessMessage] = useState(''); // Used for all info/success messages
  const [isVerified, setIsVerified] = useState(false); // NEW: Controls the final redirect countdown
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // 🟢 State for Password Validation Feedback
  const [passwordStrengthResult, setPasswordStrengthResult] = useState({});

  // Error States
  const [errors, setErrors] = useState({}); // Local form validation errors
  const [apiError, setApiError] = useState(''); // Global API errors for both steps

  // ------------------------------------------------------------------
  // --- LIFECYCLE HOOKS (Timer & Redirect) ---
  // ------------------------------------------------------------------

  // OTP timer countdown for resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (step === 'verify' && timer === 0) {
        // Auto-focus on the first OTP input when verification step starts and timer is zero
        otpInputRefs.current[0]?.focus();
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // Redirect countdown after successful verification
  useEffect(() => {
    let redirectInterval;
    
    // REDIRECTION LOGIC NOW DEPENDS ON isVerified, NOT just successMessage
    if (isVerified && step === 'verify' && redirectCountdown > 0) {
      redirectInterval = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isVerified && step === 'verify' && redirectCountdown === 0) {
      // THIS IS THE ONLY PLACE WHERE NAVIGATION TO LOGIN HAPPENS, after verification
      navigate('/login', { state: { email: formData.email } });
    }
    // Updated dependencies to include isVerified
    return () => clearInterval(redirectInterval);
  }, [isVerified, redirectCountdown, navigate, formData.email, step]);

  // ------------------------------------------------------------------
  // --- VALIDATION AND CHANGE HANDLERS ---
  // ------------------------------------------------------------------

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email';
    
    // 🟢 CHANGE: Use the utility function's strict check for form submission
    if (!validatePasswordStrength(formData.password).isStrong) {
        newErrors.password = 'Password is not strong enough';
    }
    
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phone) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 🟢 NEW: Live Password Validation Logic
    if (name === 'password') {
        const result = validatePasswordStrength(value);
        setPasswordStrengthResult(result);
        
        // Also clear password error if a password is typed
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };
  
  // ------------------------------------------------------------------
  // --- OTP HANDLERS ---
  // ------------------------------------------------------------------

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Auto-focus on the next input field
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Move focus to previous input on Backspace if current field is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    setApiError('');
    setSuccessMessage('');
    setOtp(['', '', '', '', '', '']); 

    try {
      // API call to resend OTP
      await api.post('/auth/resend-otp', { email: formData.email });
      setTimer(60); 
      setSuccessMessage('New OTP sent! Check your email inbox.');
    } catch (err) {
      const errorDetail = err.response?.data?.error || 'Failed to resend OTP. Try again later.';
      setApiError(errorDetail);
    } finally {
      setResending(false);
    }
  };

  // ------------------------------------------------------------------
  // --- SUBMISSION HANDLERS ---
  // ------------------------------------------------------------------

  // 1. Universal Submission Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError('');

    if (step === 'register') {
      handleRegister();
    } else if (step === 'verify') {
      handleVerifyOTP();
    }
  }

  // 2. Step 1: Register the user
  const handleRegister = async () => {
    // 🟢 NEW: Check strength result before form submission
    if (!validatePasswordStrength(formData.password).isStrong) {
        setErrors(prev => ({ ...prev, password: 'Password does not meet security requirements.' }));
        setApiError('Password must be strong (min 8 chars, including special, caps, and numbers).');
        return;
    }
    
    if (!validateForm()) return;
    setLoading(true);
    setSuccessMessage('');

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
      });

      // SUCCESS: Switch to verification view (NO REDIRECTION)
      setStep('verify');
      setTimer(60); // Start the resend timer
      setSuccessMessage(`OTP sent to ${formData.email}. Please verify your account.`);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      const errorDetail = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Check if email is already in use.';
      setApiError(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  // 3. Step 2: Verify the OTP
  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setApiError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);

    try {
      // API call to verify OTP
      await api.post('/auth/verify-otp', { email: formData.email, otp: otpString });

      // Verification Success: Set the final success message AND the isVerified flag
      setSuccessMessage('🎉 Email verified successfully! Redirecting to login...');
      setIsVerified(true); // <--- This flag now triggers the countdown and redirect
      setApiError(''); 
    } catch (err) {
      const errorDetail = err.response?.data?.error || 'Invalid OTP. Please try again.';
      setApiError(errorDetail);
      setOtp(['', '', '', '', '', '']); // Clear OTP input on failure
    } finally {
      setLoading(false);
    }
  };


  // ------------------------------------------------------------------
  // --- UI RENDERING ---
  // ------------------------------------------------------------------

  const renderRegistrationForm = () => (
    <>
      {/* Role Select */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        
        <button
          type="button"
          onClick={() => handleRoleSelect(UserRole.TENANT)}
          className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
            formData.role === UserRole.TENANT 
            ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md' 
            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
          }`}
        >
          <User size={24} className="mb-2" />
          <span className="text-sm font-semibold">Tenant</span>
          {formData.role === UserRole.TENANT && (
            <div className="absolute top-2 right-2 text-primary-600">
              <CheckCircle2 size={16} fill="currentColor" className="text-white" />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleRoleSelect(UserRole.LANDLORD)}
          className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
            formData.role === UserRole.LANDLORD 
            ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md' 
            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 size={24} className="mb-2" />
          <span className="text-sm font-semibold">Landlord</span>
          {formData.role === UserRole.LANDLORD && (
            <div className="absolute top-2 right-2 text-primary-600">
              <CheckCircle2 size={16} fill="currentColor" className="text-white" />
            </div>
          )}
        </button>

      </div>

      <Input
        label="Full Name"
        name="name"
        placeholder="e.g. Your Name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        icon={<User size={18} />}
      />

      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="email@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        icon={<Mail size={18} />}
      />

      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        placeholder="+977 9999999999"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        icon={<Phone size={18} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* 🟢 MODIFIED: Password Input with Live Feedback */}
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={<KeyRound size={18} />}
          rightElement={
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          // 🎯 PASSING THE FEEDBACK COMPONENT AS A FOOTER PROP
          footer={<PasswordFeedback password={formData.password} />}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={<KeyRound size={18} />}
          rightElement={
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="hover:text-slate-600 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          footer={<PasswordMatchFeedback password={formData.password} confirmPassword={formData.confirmPassword} />}
        />
      </div>
    </>
  );
  const renderVerificationForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500 rounded-xl shadow-lg shadow-primary-500/30 mb-4">
          <Lock size={28} className="text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Verify Email</h2>
        <p className="text-gray-500">
          Enter the 6-digit code sent to: <strong className="text-primary-600">{formData.email}</strong>
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex gap-3 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => otpInputRefs.current[index] = el}
            id={`otp-${index}`}
            type="text"
            className={`w-12 h-14 text-center text-3xl font-mono font-bold rounded-lg shadow-inner 
                        bg-gray-50 text-gray-900 border border-gray-300
                        focus:outline-none focus:ring-2 focus:ring-primary-500 
                        transition-all duration-150 ${digit ? 'border-primary-500' : ''}`}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            maxLength="1"
            inputMode="numeric"
            autoComplete="off"
            disabled={loading || isVerified}
          />
        ))}
      </div>

      {/* Resend Link/Timer */}
      <div className="pt-4 text-center space-y-3">
        <p className="text-sm text-gray-500">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResend}
          disabled={timer > 0 || resending || loading || isVerified}
          className="font-medium text-primary-600 hover:text-primary-700 disabled:text-gray-400 transition-colors disabled:cursor-not-allowed"
        >
          {(resending || loading) ? (
            <span className="flex items-center justify-center">
              <Loader2 size={16} className="animate-spin mr-1" /> Sending...
            </span>
          ) : timer > 0 ? (
            `Resend in ${timer} seconds`
          ) : (
            'Resend Code Now'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-gray-50 overflow-hidden">

      {/* 🌟 Left Aesthetic Branding Section (Image + Light Overlay - same as LoginPage) */}
      <motion.div 
        initial={{ x: "-100%" }}
        animate={{ x: "0%" }}
        transition={{ duration: 0.8, ease: [0.6, 0.01, -0.05, 0.9] }}
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
              Join Gharkhoj<br />
              <motion.span 
                 initial={{ color: "#3b82f6" }}
                 animate={{ color: ["#3b82f6", "#f59e0b", "#3b82f6"] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="inline-block"
              >
                Today.
              </motion.span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg text-slate-600 leading-relaxed">
              Find your perfect home or manage your property with ease. Join thousands of satisfied users on our platform.
            </motion.p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4 text-sm text-slate-600">
            <p>✨ Browse beautiful properties</p>
            <p>🔒 Secure tenant-landlord matching</p>
            <p>📱 Easy digital agreements</p>
          </motion.div>
        </div>
      </motion.div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative">

        <div className="w-full max-w-md z-10 animate-fade-in">

          <div className="mb-10 text-center md:text-left">
            <Link to="/" className="lg:hidden inline-block">
              <img 
                src={gharkhojLogo} 
                alt="Gharkhoj Logo" 
                className="h-14 w-auto mx-auto md:mx-0 mb-6 cursor-pointer"
              />
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {step === 'register' ? 'Create Account' : 'Verify Account'}
            </h2>
            <p className="text-slate-500">
              {step === 'register' ? 'Join Gharkhoj Today' : 'A quick step to finalize your registration.'}
            </p>
          </div>

          {/* Global API Error Display */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start gap-3 text-sm animate-slide-up">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-red-500 transform rotate-45" />
              {apiError}
            </div>
          )}

          {/* Global Success Message Display */}
          {successMessage && !apiError && (
             <div className="mb-6 p-4 flex items-center justify-center bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm animate-fadeIn">
              <MailCheck size={20} className="mr-2" />
              {/* Only show the countdown if isVerified is true */}
              <span>{successMessage} {isVerified && redirectCountdown > 0 && <strong>({redirectCountdown}s)</strong>}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {step === 'register' ? renderRegistrationForm() : renderVerificationForm()}
            
            {/* Submit Button (Changes text based on step) */}
            <button
              type="submit"
              disabled={loading || isVerified} // Disable if already verified
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-600/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {step === 'register' ? 'Create Account & Send OTP' : 'Verify Account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          {/* Footer Navigation */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {step === 'register' ? "Already have an account?" : "Need to change details?"}{' '}
              
              <Link 
                to="/login" 
                className="text-primary-600 font-semibold hover:text-primary-700 hover:underline underline-offset-4 decoration-2"
              >
                {step === 'register' ? "Login here" : "Go to Login"}
              </Link>
            </p>
            
            {/* Option to go back to registration details if verification is stuck */}
            {step === 'verify' && (
                 <button 
                    type="button" 
                    onClick={() => {
                        setStep('register');
                        setApiError('');
                        setSuccessMessage('');
                        setIsVerified(false); // Reset verification state if user goes back
                    }}
                    className="mt-2 text-xs text-slate-500 hover:text-slate-700 hover:underline transition-colors"
                >
                    &larr; Back to Registration Details
                </button>
            )}
            
          </div>

        </div>
      </div>

    </div>
  );
};

export default RegisterPage;