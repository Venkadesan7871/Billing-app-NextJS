'use client';
import React, { useState } from 'react';
import '../css/login.css';
import { Work_Sans } from 'next/font/google';

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export function Login({ onToggle, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Login failed' }));
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }
      setError('');
      setLoading(false);
      onSuccess();
    } catch (err) {
      setLoading(false);
      setError('Network error, please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='layout-login'>
      <div className="login-container">
        <div className='login-form'>
          <div className='login-first-section'>
            <div className='logo'>
              <img src='logologin.svg' alt='login-logo'></img>
            </div>
            <h1>Sign In</h1>
            <p>Welcome back, please enter your details.</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className='input-container'>
              {error && <p className="error-text">{error}</p>}
              <div className="usernameContainer">
                <label>
                  <p>Username</p>
                  <input
                    placeholder="Enter your username"
                    value={username}
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Please enter your username")}
                    onInput={(e) => e.target.setCustomValidity("")}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </label>
              </div>
              <div className="usernameContainer password-con">
                <label>
                  <p>Password</p>
                  <div className='password-inn' style={{ position: 'relative' }}>
                    <input
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Please enter your password")}
                      onInput={(e) => e.target.setCustomValidity("")}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={togglePasswordVisibility}>
                      <img
                        src={showPassword ? 'visible.svg' : 'window.svg'}
                        alt='toggle visibility'
                        className='visible'
                      />
                    </button>
                  </div>
                </label>
              </div>
              <div className="btn-container">
                <button className="btn-primary" type='submit' disabled={loading}>
                  <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                </button>
              </div>
              <p className={`toggle-text ${workSans.className}`}>
                Don’t have an account?{' '}
                <button className="toggle-link" type="button" onClick={onToggle}>
                  Register
                </button>
              </p>
            </div>
          </form>
        </div>
        <div className="footer-text-container">
          <p className="footer-text">© 2024 ShineCreates. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

