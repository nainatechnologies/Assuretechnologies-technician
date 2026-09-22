import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

const AuthRedirect = () => {
  const token = localStorage.getItem('technician_token') || localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
};


function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Smoothly hide splash screen when app is ready
      SplashScreen.hide().catch(() => {});

      // Handle Android hardware back button
      const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
        const path = window.location.pathname;
        if (path === '/' || path === '/login' || path === '/dashboard') {
          CapApp.exitApp();
        } else if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });

      return () => {
        backListener.then((handle) => handle.remove()).catch(() => {});
      };
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/login" element={<AuthRedirect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
