// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { Eye, EyeOff, Loader2, Mail, KeyRound, ArrowRight } from "lucide-react";
// import Input from "./ui/Input";
// import api from "../../api/axios";
// import modernInterior from "../../assets/modern-interior1.webp";

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     if (error) setError("");
//   };

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   setError("");
//   setLoading(true);

//   try {
//     console.log("Login payload:", formData); // Debug payload

//     // STEP 1: Fetch role from backend based on email
//     const roleResponse = await api.get("/auth/getUserRoleByEmail", {
//       params: { email: formData.email }
//     });

//     if (!roleResponse.data.success) {
//       setError("User not found");
//       setLoading(false);
//       return;
//     }

//     const role = roleResponse.data.role; // <-- Correct role

//     // STEP 2: Login with email, password, and fetched role
//     const response = await api.post("/auth/login", {
//       email: formData.email,
//       password: formData.password,
//       role: role
//     });

//     console.log("Login response:", response.data); // Debug response

//     const { user, accessToken, refreshToken } = response.data;
//     console.log("USER FULL OBJECT:", user);
//     console.log("USER ROLE:", user?.role);


//     // Save tokens
//     localStorage.setItem("accessToken", accessToken);
//     localStorage.setItem("refreshToken", refreshToken);

//     // Navigate based on role
//     navigate(`/${user.role}`);

//   } catch (err) {
//     console.error("Login error:", err.response?.data || err);
//     setError(err.response?.data?.error || "Login failed. Please try again.");
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <div className="min-h-screen w-full flex bg-slate-50">

//       {/* Left Branding Section (same as Register) */}
//       <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-dark">
//         <div className="absolute inset-0 z-0">
//          <img
//             src={modernInterior}
//             alt="Modern interior"
//             className="w-full h-full object-cover opacity-60"
//         />
//           <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
//         </div>

//         <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full text-white">
//           <div>
//             <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-primary-600/30">
//               <span className="text-2xl font-bold text-white">GK</span>
//             </div>
//             <h1 className="text-5xl font-display font-bold leading-tight mb-6">
//               Welcome Back<br />
//               <span className="text-primary-400">to Gharkhoj.</span>
//             </h1>
//             <p className="text-lg text-slate-300 max-w-md leading-relaxed">
//               Sign in to access verified listings, secure chats, and personalized recommendations.
//             </p>
//           </div>

//           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
//             <p className="text-slate-300 italic text-sm">
//               "A smooth and secure way to find your next home or tenant!"
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Right Form Section */}
//       <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative">

//         <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50 pointer-events-none mix-blend-multiply lg:hidden"></div>

//         <div className="w-full max-w-md z-10 animate-fade-in">

//           <div className="mb-10">
//             {/* GK Logo on Mobile */}
//             <div className="lg:hidden w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-600/30">
//               <span className="text-2xl font-bold text-white">GK</span>
//             </div>

//             <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
//             <p className="text-slate-500">Login to continue</p>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-sm animate-slide-up">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">

//             <Input
//               label="Email Address"
//               name="email"
//               type="email"
//               placeholder="john@example.com"
//               value={formData.email}
//               onChange={handleChange}
//               icon={<Mail size={18} />}
//             />

//             <Input
//               label="Password"
//               name="password"
//               type={showPassword ? "text" : "password"}
//               placeholder="••••••••"
//               value={formData.password}
//               onChange={handleChange}
//               icon={<KeyRound size={18} />}
//               rightElement={
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="hover:text-slate-600 focus:outline-none"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               }
//             />

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-600/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4"
//             >
//               {loading ? (
//                 <Loader2 size={20} className="animate-spin" />
//               ) : (
//                 <>
//                   Login
//                   <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
//                 </>
//               )}
//             </button>

//           </form>

//           <div className="mt-8 text-center">
//             <p className="text-slate-500 text-sm">
//               Don't have an account?{" "}
//               <Link
//                 to="/register"
//                 className="text-primary-600 font-semibold hover:text-primary-700 hover:underline underline-offset-4 decoration-2"
//               >
//                 Register here
//               </Link>
//             </p>
//           </div>

//         </div>
//       </div>

//     </div>
//   );
// };

// export default LoginPage;
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, KeyRound, ArrowRight } from "lucide-react";
import Input from "./ui/Input";
import api from "../../api/axios";
import modernInterior from "../../assets/interior1.jpg";
import { useAuthStore } from "../../stores/authStore";

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
              Welcome Back<br />
              <span className="text-primary-400">to Gharkhoj.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              Sign in to access verified listings, secure chats, and personalized recommendations.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <p className="text-slate-300 italic text-sm">
              "A smooth and secure way to find your next home or tenant!"
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50 pointer-events-none mix-blend-multiply lg:hidden"></div>

        <div className="w-full max-w-md z-10 animate-fade-in">
          <div className="mb-10">
            {/* Mobile Logo */}
            <div className="lg:hidden w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-600/30">
              <span className="text-2xl font-bold text-white">GK</span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Login to continue</p>
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
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={18} />}
            />

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
                  className="hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
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
                  Login
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-600 font-semibold hover:text-primary-700 hover:underline underline-offset-4 decoration-2"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

