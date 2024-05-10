'use client'
import React, { createContext, useState, useEffect } from 'react';
import {cookies} from 'next/headers';

// Create the context
export const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const token = cookies().get('token');
  const refresh_token = cookies().get('refresh_token');
  useEffect(() => {
    // Check if the user is logged in (e.g., by checking for a token in local storage)
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  return (
    <AuthContext.Provider value={{ isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};