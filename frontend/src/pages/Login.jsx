import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api'; // ✅ Error 2 fixed: Added import
import './Login.css';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  
  // ✅ Error 1 fixed: Moved state INSIDE the component
  const [step, setStep] = useState(1); 
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data; // Changed from 'res' to 'data'
      
      if (tab === 'login') {
        data = await api.login(form.email, form.password);
      } else {
        data = await api.register(form.name, form.email, form.password);
      }

      // ✅ Error 3 fixed: No need for data.json() because api.js handles it
      if (data.error) {
        alert(data.error);
        return;
      }

      if (tab === "login") {
        localStorage.setItem("user_id", data.user_id);
        setSuccess(true);
        setTimeout(() => navigate("/"), 1500);
      } else {
        alert("Registration successful! Switching to Login.");
        setTab('login'); 
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Something went wrong. Check your console.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const data = await api.forgotPassword(form.name);
      if (data.error) {
        alert(data.error);
      } else {
        alert("OTP sent to your registered email!");
        setStep(2); 
      }
    } catch (err) {
      console.error("Forgot password error", err);
    }
  };

const handleResetSubmit = async (e) => {
  e.preventDefault();
  try {
    const data = await api.resetPassword(form.name, otp, newPassword);
    if (data.error) {
      alert(data.error);
    } else {
      setSuccess(true); // Show the "✅ Password updated!" alert
      setTimeout(() => {
        setTab('login');
        setStep(1);
        setSuccess(false); // Hide the alert when going back to login
        setOtp('');        // Clear the fields
        setNewPassword('');
      }, 2000);
    }
  } catch (err) {
    console.error("Reset error", err);
  }
};

  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-logo">🌿 EcoGuide</div>
        <div className="auth-sub">Join your city's waste management community</div>

        {success && (
          <div className="alert-success">
            ✅ {tab === 'login' ? 'Welcome back!' : tab === 'forgot' ? 'Password updated!' : 'Account created!'} Redirecting…
          </div>
        )}

        {tab !== 'forgot' && (
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
              Sign In
            </button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
              Register
            </button>
          </div>
        )}

        {tab === 'forgot' ? (
          <form onSubmit={step === 1 ? handleForgotPassword : handleResetSubmit}>
            <div className="auth-sub" style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
              {step === 1 ? "Enter your username to receive an OTP" : "Enter the code and your new password"}
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Your username"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

{/* Replace the fragment inside step === 2 with this for the animation you added to CSS */}
{step === 2 && (
  <div className="otp-animation"> 
    <div className="form-group">
      <label>OTP Code</label>
      <input
        type="text"
        placeholder="Enter 4-digit OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        required
      />
    </div>
    <div className="form-group">
      <label>New Password</label>
      <input
        type="password"
        placeholder="Minimum 6 characters"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
      />
    </div>
  </div>
)}

            <button type="submit" className="btn-full">
              {step === 1 ? 'Send OTP' : 'Reset Password'}
            </button>

            <button type="button" className="link-btn" style={{ marginTop: '10px', width: '100%' }} onClick={() => { setTab('login'); setStep(1); }}>
              Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            {tab === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder={tab === 'login' ? 'Enter your password' : 'Create a strong password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {tab === 'login' && (
              <div className="forgot-link">
                <button type="button" className="link-btn" onClick={() => setTab('forgot')}>
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="btn-full">
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}