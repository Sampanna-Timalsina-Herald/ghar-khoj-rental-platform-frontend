import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { Loader } from 'lucide-react';
import modernInterior from '../../assets/modern-interior1.webp';

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  const navigate = useNavigate();
  const location = useLocation();

  // Load email from previous page
  useEffect(() => {
    const receivedEmail = location.state?.email;
    if (!receivedEmail) {
      navigate('/register');
      return;
    }
    setEmail(receivedEmail);
  }, [location, navigate]);

  // OTP timer countdown for resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Redirect countdown after success
  useEffect(() => {
    if (successMessage && redirectCountdown > 0) {
      const interval = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (successMessage && redirectCountdown === 0) {
      navigate('/login');
    }
  }, [successMessage, redirectCountdown, navigate]);

  // Handle OTP input changes
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setRedirectCountdown(3);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', { email, otp: otpString });
      console.log("API Response:", response.data);

      if (!response.data.success) {
        setError(response.data.error || 'Invalid OTP');
        return;
      }

      // Success: show message and start countdown
      setSuccessMessage('🎉 Email verified successfully! Redirecting to login...');
    } catch (err) {
      console.error('OTP Error:', err.response?.data || err);
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/auth/resend-otp', { email });
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="relative w-full max-w-md animate-fadeIn">
        {/* Background */}
        <img
          src={modernInterior}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-20 rounded-2xl"
        />

        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-md animate-slideUp">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-lg shadow-md mb-4 animate-bounce-slow">
              <span className="text-2xl font-bold text-white">GK</span>
            </div>
            <h1 className="text-3xl font-bold text-text">Verify Email</h1>
            <p className="text-gray-600 mt-2">Enter the OTP sent to <strong>{email}</strong></p>
            <button
              onClick={() => navigate('/register')}
              className="text-sm text-primary-600 hover:underline mt-1"
            >
              Not your email? Re-enter
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 rounded animate-fadeIn">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded animate-fadeIn">
              {successMessage} <span className="font-bold">{redirectCountdown}s</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength="1"
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg 
                  focus:outline-none focus:border-primary-600 transition-all animate-pop"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-xl shadow-md hover:bg-primary-700 
              disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={timer > 0 || resending}
              className="text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
