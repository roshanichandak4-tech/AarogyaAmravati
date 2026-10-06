import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const getInitialAdmin = () => {
    try {
      const saved = localStorage.getItem('amravati_hospital_admin');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  const [admin, setAdmin] = useState(getInitialAdmin);
  const [token, setToken] = useState(localStorage.getItem('amravati_hospital_token') || '');
  const [loading, setLoading] = useState(false); // Instant ready 0 delay!

  // Silent background re-verification (non-blocking)
  useEffect(() => {
    if (!token) {
      setAdmin(null);
      localStorage.removeItem('amravati_hospital_admin');
      return;
    }

    const verifySilent = async () => {
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setAdmin(res.data.hospital);
          localStorage.setItem('amravati_hospital_admin', JSON.stringify(res.data.hospital));
        } else {
          logout();
        }
      } catch (err) {
        console.error('Silent auth verify error:', err);
        logout();
      }
    };

    verifySilent();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setAdmin(res.data.hospital);
      localStorage.setItem('amravati_hospital_token', res.data.token);
      localStorage.setItem('amravati_hospital_admin', JSON.stringify(res.data.hospital));
    }
    return res.data;
  };

  const register = async (hospitalData) => {
    const res = await axios.post('/api/auth/register', hospitalData);
    if (res.data.success) {
      setToken(res.data.token);
      setAdmin(res.data.hospital);
      localStorage.setItem('amravati_hospital_token', res.data.token);
      localStorage.setItem('amravati_hospital_admin', JSON.stringify(res.data.hospital));
    }
    return res.data;
  };

  const logout = () => {
    setToken('');
    setAdmin(null);
    localStorage.removeItem('amravati_hospital_token');
    localStorage.removeItem('amravati_hospital_admin');
  };

  const updateAdminState = (updatedHospital) => {
    setAdmin(updatedHospital);
    localStorage.setItem('amravati_hospital_admin', JSON.stringify(updatedHospital));
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, register, logout, updateAdminState }}>
      {children}
    </AuthContext.Provider>
  );
};
