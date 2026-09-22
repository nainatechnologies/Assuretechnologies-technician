import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../services/api';
import './Login.css';

export default function Login() {
  const [step, setStep] = useState<'LOGIN' | 'SET_PASSWORD'>('LOGIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('technician_token') || localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setPasswordError('');
    setLoading(true);

    try {
      const isMobile = /^\d+$/.test(identifier);
      const payload = isMobile ? { mobile: identifier, password: password } : { email: identifier, password: password };
      const response = await api.post('/auth/technician/login', payload);

      if (response.data.success) {
        if (response.data.requiresPasswordChange) {
          Swal.fire({
            title: 'Password Reset Required',
            text: 'Please set a new secure password for your first-time login.',
            icon: 'info',
            confirmButtonColor: '#4F46E5',
            confirmButtonText: 'Continue'
          });
          setStep('SET_PASSWORD');
          return;
        }

        if (response.data.data?.token) {
          localStorage.setItem('technician_token', response.data.data.token);
          localStorage.setItem('authToken', response.data.data.token);
        }
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        Swal.fire({
          title: 'Success!',
          text: 'You have successfully logged in.',
          icon: 'success',
          confirmButtonColor: '#4F46E5',
          timer: 1500
        }).then(() => {
          navigate('/dashboard');
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      Swal.fire({
        title: 'Error!',
        text: message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (newPassword === password) {
      setPasswordError('New password cannot be the same as the old password');
      return;
    }

    setPasswordError('');
    setLoading(true);

    try {
      const isMobile = /^\d+$/.test(identifier);
      const payload = isMobile ? { mobile: identifier, old_password: password, new_password: newPassword, confirm_password: confirmPassword } : { email: identifier, old_password: password, new_password: newPassword, confirm_password: confirmPassword };
      const response = await api.post('/auth/technician/set-password', payload);

      if (response.data.success) {
        if (response.data.data?.token) {
          localStorage.setItem('technician_token', response.data.data.token);
          localStorage.setItem('authToken', response.data.data.token);
        }
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        Swal.fire({
          title: 'Password Updated!',
          text: 'Your password has been changed successfully. Logging you in...',
          icon: 'success',
          confirmButtonColor: '#4F46E5',
          timer: 2000
        }).then(() => {
          navigate('/dashboard');
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Failed to update password';
      Swal.fire({
        title: 'Error!',
        text: message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-panel animate-fade-in">
        <div className="login-logo"></div>
        <h2 className="login-title">Technician Portal</h2>

        {step === 'LOGIN' ? (
          <>
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
                  <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
                    Forgot password?
                  </a>
                </div>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
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
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              {passwordError && <div className="input-error" style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{passwordError}</div>}

              <div className="login-btn-wrapper" style={{ marginTop: '20px' }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="login-subtitle" style={{ color: '#4338ca', fontWeight: '500' }}>
              Create a new password for your account
            </p>
            <form onSubmit={handleSetNewPassword}>
              <div className="input-group">
                <label className="input-label">Email Account</label>
                <input
                  type="text"
                  className="input-field"
                  value={identifier}
                  disabled
                  style={{ backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    className="input-field"
                    placeholder="Min. 8 chars (uppercase, number, symbol)"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (e.target.value.length >= 8) setPasswordError('');
                    }}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="input-field"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (e.target.value === newPassword) setPasswordError('');
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              {passwordError && <div className="input-error" style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{passwordError}</div>}

              <div className="login-btn-wrapper" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: '1', padding: '10px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
                  onClick={() => { setStep('LOGIN'); setPasswordError(''); }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: '2' }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Set Password & Login'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
