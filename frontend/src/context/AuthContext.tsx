import React, { useState, useEffect } from 'react';
import type { User, UserRegisterInput } from '../types';
import { api } from '../services/api';
import { AuthContext } from './hooks';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('clearsky_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    async function loadUser() {
      if (token) {
        try {
          const u = await api.getMe();
          if (active) setUser(u);
        } catch {
          localStorage.removeItem('clearsky_token');
          if (active) {
            setToken(null);
            setUser(null);
          }
        }
      }
      if (active) setIsLoading(false);
    }
    void loadUser();
    return () => {
      active = false;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('clearsky_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (data: UserRegisterInput) => {
    const res = await api.register(data);
    localStorage.setItem('clearsky_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('clearsky_token');
    setToken(null);
    setUser(null);
  };

  const deleteAccount = async () => {
    await api.deleteAccount();
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};
