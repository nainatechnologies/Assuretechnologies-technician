import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword, requestPasswordResetOtp } from '../services/auth';
import Swal from 'sweetalert2';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMobile = location.state?.mobile || '';
  const startCountdown = location.state?.startCountdown || false;

  const [mobile, setMobile] = useState(initialMobile);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(startCountdown ? 30 : 0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendOtp = async () => {
    try {
      const data = await requestPasswordResetOtp(mobile);
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: data.message || 'OTP resent successfully',
        icon: 'success'
      });
      setCountdown(30);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: message,
        icon: 'error'
      });
      if (error.response?.status === 429) {
        setCountdown(30);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'Passwords do not match!',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    if (newPassword.length < 8) {
      Swal.fire({
        title: 'Error!',
        text: 'New password must be at least 8 characters long',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await resetPassword({ mobile, otp, newPassword });
      
      Swal.fire({
        title: 'Success!',
        text: data.message || 'Password reset successfully',
        icon: 'success',
        confirmButtonColor: '#4F46E5',
        timer: 2000
      }).then(() => {
        navigate('/');
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      Swal.fire({
        title: 'Error!',
        text: message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-panel animate-fade-in" style={{ maxWidth: '500px' }}>
        <div className="login-logo"></div>
        <h2 className="login-title">Reset Password</h2>
        <p className="login-subtitle">Enter the OTP and your new password.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="mobile">Mobile Number</label>
            <input
              type="text"
              id="mobile"
              className="input-field"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              readOnly={!!initialMobile}
              style={initialMobile ? { backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' } : {}}
            />
          </div>
          
          <div className="input-group">
            <div className="password-header">
              <label className="input-label" htmlFor="otp">6-digit OTP</label>
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className="forgot-password"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  color: countdown > 0 ? '#9ca3af' : 'var(--primary)'
                }}
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
            <input
              type="text"
              id="otp"
              className="input-field"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                className="input-field"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
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
                onChange={(e) => setConfirmPassword(e.target.value)}
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
          
          <div className="login-btn-wrapper" style={{ marginTop: '24px' }}>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading} 
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
          
          <div className="register-link" style={{ marginTop: '20px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
