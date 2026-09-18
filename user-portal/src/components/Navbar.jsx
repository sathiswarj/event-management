import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-amber-600" />
              <span className="font-heading text-2xl font-bold text-gray-900 tracking-tight">Elegance Events</span>
            </Link>
          </div>

          {/* Desktop Menu - Center */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`${isActive(link.path)
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-gray-600 hover:text-amber-600 hover:border-b-2 hover:border-amber-300'
                  } px-1 py-2 text-sm font-medium transition-colors duration-200`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions - Right */}
          <div className="hidden md:flex flex-shrink-0 items-center space-x-4">
            <Link
              to="/book"
              className="hidden md:inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors"
            >
              Book Now
            </Link>
            {user ? (
              <div className="relative group">
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-amber-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium hidden lg:block">{user.name || 'Profile'}</span>
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className={`${isActive('/login')
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-gray-600 hover:text-amber-600 hover:border-b-2 hover:border-amber-300'
                  } px-1 py-2 text-sm font-medium transition-colors duration-200`}
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`${isActive(link.path)
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } block px-3 py-2 rounded-md text-base font-medium`}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <>

                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className={`${isActive('/profile')
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } block px-3 py-2 rounded-md text-base font-medium`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className={`${isActive('/login')
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } block px-3 py-2 rounded-md text-base font-medium`}
              >
                Log In
              </Link>
            )}

            <Link
              to="/book"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-4 px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
