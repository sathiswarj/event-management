import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, UserPlus, Lock, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Accounts = () => {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/auth/users', { withCredentials: true });
      setAdmins(res.data);
    } catch (error) {
      console.error('Failed to fetch admins', error);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/auth/register', newAdmin, { withCredentials: true });
      toast.success('New admin created successfully');
      setShowModal(false);
      setNewAdmin({ email: '', password: '' });
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Accounts</h1>
          <p className="text-gray-500 mt-1">Manage system access and privileges.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shadow-md shadow-amber-500/20">
          <UserPlus className="w-5 h-5 mr-2" />
          Add New Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center bg-gray-50">
          <Shield className="w-6 h-6 text-amber-500 mr-3" />
          <h2 className="text-lg font-bold text-gray-900">Registered Administrators</h2>
        </div>
        <div className="p-6 space-y-4">
          {admins.map((admin) => (
            <div key={admin._id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {admin.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{admin.email}</p>
                  <div className="flex items-center mt-1">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Super Admin</span>
                    <span className="text-gray-400 text-sm ml-3">Created: {format(new Date(admin.createdAt || new Date()), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-amber-500 transition-colors p-2" title="Reset Password">
                <Lock className="w-5 h-5" />
              </button>
            </div>
          ))}
          {admins.length === 0 && <p className="text-center text-gray-500">No administrators found.</p>}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Add New Administrator</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="admin@eleganceevents.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input 
                  type="password" 
                  required
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:opacity-70"
              >
                {loading ? 'Creating...' : 'Create Admin Account'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Accounts;
