import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API_URL = `${API_BASE_URL}/admin/auth/`;

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  if (response.data) {
    localStorage.setItem('admin', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = async () => {
  await axios.post(API_URL + 'logout');
  localStorage.removeItem('admin');
};

const authService = {
  login,
  logout,
};

export default authService;
