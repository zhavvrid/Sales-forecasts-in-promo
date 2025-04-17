/*
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        roles: JSON.parse(localStorage.getItem('roles')) || [], // Роли из localStorage
    });

    const login = (token, userData, roles) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('roles', JSON.stringify(roles)); // Сохраняем роли
        setAuthState({ token, user: userData, roles });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('roles'); // Удаляем роли
        setAuthState({ token: null, user: null, roles: [] });
    };

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);*/
