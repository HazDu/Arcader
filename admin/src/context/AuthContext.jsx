import React, { createContext, useContext, useState, useEffect } from 'react';
import * as RequestUtil from '../utils/RequestUtil';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (password) => {
        const response = await RequestUtil.login(password);
        setIsAuthenticated(true);
        return response;
    };

    const logout = () => {
        RequestUtil.setToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);