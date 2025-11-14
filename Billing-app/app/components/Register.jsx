'use client';
import React from "react";
import { Work_Sans } from "next/font/google";
import "../css/register.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function Register({ onToggle }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [restaurantName, setRestaurantName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password || !confirm || !mobile || !email || !restaurantName || !address) {
      setError("All fields are required.");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    // Basic mobile number validation (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password,
          mobile,
          email,
          restaurantName,
          address
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }
      setLoading(false);
      onToggle();
    } catch (err) {
      setLoading(false);
      setError('Network error, please try again.');
    }
  };

  return (
    <div className={`register-layout ${workSans.className}`}>
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="icon-box">
              <span className="material-symbols-outlined">restaurant_menu</span>
            </div>
            <div className="title-box">
              <p className="title">Create Your Account</p>
              <p className="subtitle">Start managing your restaurant with ease.</p>
            </div>
          </div>

          <form className="register-form" onSubmit={handleRegister}>
            {error && <div className="full-width" style={{ color: '#dc2626', gridColumn: '1 / -1' }}>{error}</div>}
            
            <div className="form-field">
              <label className="label-text">Restaurant Name</label>
              <input className="input-field" type="text" placeholder="Restaurant name" required 
                value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
            </div>

            <div className="form-field">
              <label className="label-text">Email</label>
              <input className="input-field" type="email" placeholder="your@email.com" required 
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-field">
              <label className="label-text">Mobile</label>
              <input className="input-field" type="tel" placeholder="1234567890" required 
                value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>

            <div className="form-field">
              <label className="label-text">Username</label>
              <input className="input-field" type="text" placeholder="Choose username" required 
                value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="form-field full-width">
              <label className="label-text">Restaurant Address</label>
              <textarea className="input-field" rows="2" placeholder="Full restaurant address" required 
                value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="form-field">
              <label className="label-text">Password</label>
              <div className="input-group">
                <input 
                  className="input-field input-left" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <div 
                  className="input-icon password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
              <p className="note-text">At least 8 characters</p>
            </div>

            <div className="form-field">
              <label className="label-text">Confirm Password</label>
              <div className="input-group">
                <input 
                  className="input-field input-left" 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  value={confirm} 
                  onChange={(e) => setConfirm(e.target.value)} 
                />
                <div 
                  className="input-icon password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
            </div>

            <div className="register-actions full-width">
              <button className="register-btn" type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <p className={`toggle-text ${workSans.className}`}>
                Already have an account?{" "}
                <button className="toggle-link" type="button" onClick={onToggle}>
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

