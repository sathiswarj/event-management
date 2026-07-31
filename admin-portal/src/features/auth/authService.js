import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/auth/';

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
