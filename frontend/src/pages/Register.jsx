import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotice } from "../context/NoticeContext";
import usePageMeta from "../hooks/usePageMeta";

function Register() {
  usePageMeta("Register", "Create a free ShopKart account to start shopping and saving your favourite products.");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const data = await registerUser(form);
      saveLogin(data); // registering also logs the user in
      notify.success("Account created. Welcome to ShopKart.");
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} minLength={6} required />
      {error && <p className="status error">{error}</p>}
      <button className="btn" disabled={submitting}>{submitting ? "Creating..." : "Register"}</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}

export default Register;
