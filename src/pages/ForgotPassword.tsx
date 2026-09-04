import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordResetOtp } from '../services/auth';
import Swal from 'sweetalert2';
import './Login.css';

const ForgotPassword = () => {
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: 'Please enter your mobile number',
        icon: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await requestPasswordResetOtp(mobile);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: data.message || 'OTP sent successfully',
        icon: 'success'
      });

      navigate('/reset-password', { state: { mobile, startCountdown: true } });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-panel animate-fade-in">
        <div className="login-logo"></div>
        <h2 className="login-title">Forgot Password</h2>
        <p className="login-subtitle">Enter your registered mobile number to receive an OTP.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="mobile">Mobile Number</label>
            <input
              type="text"
              id="mobile"
              className="input-field"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              disabled={countdown > 0}
            />
          </div>

          <div className="login-btn-wrapper">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading || countdown > 0} 
              style={{ backgroundColor: countdown > 0 ? '#9ca3af' : undefined, cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? 'Sending...' : countdown > 0 ? `Please wait ${countdown}s...` : 'Send OTP'}
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

export default ForgotPassword;
