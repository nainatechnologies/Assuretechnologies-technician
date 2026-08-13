import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import API from '../services/api';
import { loginUser } from '../services/auth';
import './Login.css';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation 
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setPasswordError('');
    setLoading(true);

    const payload = identifier.includes('@') 
      ? { email: identifier, password } 
      : { mobile: identifier, password };

    API.post('/auth/technician/login', payload)
      .then((res) => {
        if (res.data.success) {
          loginUser(res.data.data.user);
          Swal.fire({
            title: 'Success!',
            text: 'You have successfully logged in as Technician.',
            icon: 'success',
            confirmButtonColor: '#4F46E5',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            navigate('/dashboard');
          });
        }
      })
      .catch((err) => {
        console.error('Login Error:', err);
        Swal.fire({
          title: 'Login Failed',
          text: err.response?.data?.message || 'Invalid credentials',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      })
      .finally(() => setLoading(false));
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Reset Password',
      text: 'Instructions to reset your password will be sent to your email or mobile.',
      input: 'text',
      inputPlaceholder: 'Enter your email or mobile number',
      showCancelButton: true,
      confirmButtonText: 'Send Reset Link',
      confirmButtonColor: '#4F46E5',
    });
  };

  return (
    <div className="login-container">
      <div className="login-panel animate-fade-in">
        <div className="login-logo"></div>
        <h2 className="login-title">Technician Portal</h2>
        <p className="login-subtitle">Sign in to manage your service requests</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label" htmlFor="identifier">Email or Mobile Number</label>
            <input
              type="text"
              id="identifier"
              className="input-field"
              placeholder="Enter email or mobile number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="password-header">
              <label className="input-label" htmlFor="password">Password</label>
              <a href="#" className="forgot-password" onClick={handleForgotPassword}>
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length >= 6) setPasswordError('');
              }}
              required
            />
          </div>
          {passwordError && <div className="input-error">{passwordError}</div>}

          <div className="login-btn-wrapper">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
          

        </form>
      </div>
    </div>
  );
}
