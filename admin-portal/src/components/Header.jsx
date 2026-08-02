import { Bell, LogOut, Search } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

const Header = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/admin/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('adminInfo');
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 sticky top-0">
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 focus:bg-white transition-colors w-64"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative text-gray-500 hover:text-amber-500 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white"></span>
          </span>
        </button>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
            A
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500 transition-colors flex items-center text-sm font-medium"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
