import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios"; // your axios instance

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token"); // get token from URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Optional: validate token on page load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setMessage("Invalid or missing token.");
        setLoading(false);
        return;
      }
      try {
        await api.post("/auth/validate-reset-token", { token });
        setLoading(false);
      } catch (err) {
        setMessage(err.response?.data?.message || "Invalid or expired token.");
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      setMessage(response.data.message);
      navigate("/login"); // redirect to login after success
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}
      {!message.includes("Invalid") && (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />
          <button type="submit" style={{ width: "100%", padding: 10 }}>
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;
