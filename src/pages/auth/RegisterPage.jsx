import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import modernInterior from '../../assets/modern-interior1.webp';
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
  ArrowRight
} from 'lucide-react';
import  Input  from './ui/Input';
import api from '../../api/axios';

// Convert enum to simple JS object
const UserRole = {
  TENANT: "tenant",
  LANDLORD: "landlord"
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: UserRole.TENANT,
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phone) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;
    setLoading(true);

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
      });

      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-primary-600/30">
              <span className="text-2xl font-bold text-white">GK</span>
            </div>
            <h1 className="text-5xl font-display font-bold leading-tight mb-6">
              Find your perfect <br/>
              <span className="text-primary-400">Sanctuary.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              Join Gharkhoj today. Smart search, secure contracts, happy homes.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex gap-4 items-center mb-4">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <img 
                    key={i}
                    src={`https://picsum.photos/100/100?random=${i}`} 
                    className="w-10 h-10 rounded-full border-2 border-brand-dark" 
                    alt="User" 
                  />
                ))}
              </div>
              <div className="text-sm">
                <p className="font-semibold">Trusted by 10k+ users</p>
                <div className="flex text-yellow-400 text-xs">★★★★★</div>
              </div>
            </div>
            <p className="text-slate-300 italic text-sm">
              "The easiest way I've found to rent out my properties without the usual headache."
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative">

        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50 pointer-events-none mix-blend-multiply lg:hidden"></div>

        <div className="w-full max-w-md z-10 animate-fade-in">

          <div className="mb-10">
            <div className="lg:hidden w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-600/30">
              <span className="text-2xl font-bold text-white">GK</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500">Join Gharkhoj Today</p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-sm animate-slide-up">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-red-500 transform rotate-45" />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role Select */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              
              <button
                type="button"
                onClick={() => handleRoleSelect(UserRole.TENANT)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.role === UserRole.TENANT 
                  ? 'border-primary-600 bg-primary-50 text-primary-700' 
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
                  ? 'border-primary-600 bg-primary-50 text-primary-700' 
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
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={<User size={18} />}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail size={18} />}
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+92 300 1234567"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={<Phone size={18} />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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
              />

              <Input
                label="Confirm"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={<KeyRound size={18} />}
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-600/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 font-semibold hover:text-primary-700 hover:underline underline-offset-4 decoration-2"
              >
                Login here
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
