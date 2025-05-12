// configs/MyContexts.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('@user_token');
      if (token) setUserToken(token);
      setLoading(false);
    };
    loadToken();
  }, []);

  const login = async (token) => {
    await AsyncStorage.setItem('@user_token', token);
    setUserToken(token);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@user_token');
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
