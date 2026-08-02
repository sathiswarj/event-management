import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Inbox, Users, Settings, Tags } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Requests', path: '/requests', icon: Inbox },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Internal Users', path: '/accounts', icon: Users },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shadow-2xl z-20">
      <div className="p-6">
        <h1 className="text-2xl font-serif font-bold text-amber-500">Elegance Events</h1>
        <p className="text-gray-400 text-sm mt-1">Admin Portal</p>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => clsx(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive 
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <NavLink to="/settings" className={({ isActive }) => clsx(
          "flex items-center px-4 py-3 text-sm font-medium transition-colors cursor-pointer rounded-lg",
          isActive 
            ? "bg-gray-800 text-white" 
            : "text-gray-400 hover:text-white hover:bg-gray-800"
        )}>
          <Settings className="mr-3 h-5 w-5" />
          Change Password
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
