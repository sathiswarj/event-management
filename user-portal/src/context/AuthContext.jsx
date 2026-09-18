import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            fetchUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (token) => {
        try {
            const { data } = await authAPI.getMe();
            setUser({ ...data, token });
        } catch (error) {
            console.error('Error fetching user', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await authAPI.login({ email, password });
            localStorage.setItem('token', data.token);
            setUser(data);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid email or password');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await authAPI.register(userData);
            toast.success('Registration successful. Please log in.');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
