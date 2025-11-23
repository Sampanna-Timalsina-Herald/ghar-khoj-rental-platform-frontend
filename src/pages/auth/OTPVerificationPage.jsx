import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import { Loader } from 'lucide-react';
import modernInterior from '../../assets/modern-interior1.webp'; // Local image

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  // Set email from location state
  useEffect(() => {
    const receivedEmail = location.state?.email;
    if (!receivedEmail) {
      navigate('/register');
      return;
    }
    setEmail(receivedEmail);
    console.log('Email set from location.state:', receivedEmail);
  }, [location, navigate]);

  // Timer countdown for resend OTP
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP input changes
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    console.log('OTP updated:', newOtp);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    console.log('Verifying OTP payload:', { email, otp: otpString });
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', { email, otp: otpString });
      console.log('OTP verification response:', response.data);

      const { user, token, refreshToken, role } = response.data.data;

      login(user, token, role);
      localStorage.setItem('refreshToken', refreshToken);

      navigate(`/${role}`);
    } catch (err) {
      console.error('OTP verification error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setResending(true);
    console.log('Resending OTP for email:', email);

    try {
      const response = await api.post('/auth/resend-otp', { email });
      console.log('Resend OTP response:', response.data);

      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      console.error('Resend OTP error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="relative w-full max-w-md">
        {/* Background image */}
        <img
          src={modernInterior}
          alt="Modern interior"
          className="absolute inset-0 w-full h-full object-cover opacity-20 rounded-2xl"
        />

        {/* OTP Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-lg mb-4">
              <span className="text-2xl font-bold text-white">GK</span>
            </div>
            <h1 className="text-3xl font-bold text-text">Verify Email</h1>
            <p className="text-gray-600 mt-2">Enter the OTP sent to {email}</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={timer > 0 || resending}
              className="text-primary-600 font-semibold hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
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
