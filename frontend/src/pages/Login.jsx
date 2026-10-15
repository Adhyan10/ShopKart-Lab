import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotice } from "../context/NoticeContext";
import usePageMeta from "../hooks/usePageMeta";

function Login() {
  usePageMeta("Login", "Log in to your ShopKart account to shop, save wishlist items and view your orders.");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { saveLogin } = useAuth();
  const notify = useNotice();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await loginUser(form);
      saveLogin(data);
      notify.success(`Welcome back, ${data.user.name}.`);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      {error && <p className="status error">{error}</p>}
      <button className="btn" disabled={submitting}>{submitting ? "Logging in..." : "Login"}</button>
      <p>New here? <Link to="/register">Register</Link></p>
    </form>
  );
}

export default Login;
