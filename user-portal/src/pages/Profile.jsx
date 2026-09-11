import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield, Bell, CheckCircle, Clock, XCircle, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
    const { user, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // Form States
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    // Dummy stats if user.requestStats is missing
    const stats = user?.requestStats || { total: 0, pending: 0, approved: 0, rejected: 0 };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.patch('/api/users/me', profileData, config);
            setUser({ ...user, ...data });
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('/api/users/change-password', passwordData, config);
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            toast.success('Password changed successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null; // Or a loading spinner

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">My Profile</h1>

            {/* Section 1: Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-500" />
                        Personal Information
                    </h2>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            Edit
                        </button>
                    )}
                </div>
                
                <div className="p-6">
                    {isEditing ? (
                        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">Save Changes</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium text-sm">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-slate-500 flex items-center gap-2 mb-1"><User className="w-4 h-4"/> Name</p>
                                <p className="font-medium text-slate-800">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 flex items-center gap-2 mb-1"><Mail className="w-4 h-4"/> Email</p>
                                <p className="font-medium text-slate-800">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 flex items-center gap-2 mb-1"><Phone className="w-4 h-4"/> Phone</p>
                                <p className="font-medium text-slate-800">{user.phone}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 2: Notification Preferences */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-semibold text-slate-800">Notification Preferences</h2>
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-medium text-slate-800 mb-1">Telegram Notifications</p>
                        <p className="text-sm text-slate-500">Get instant updates about your requests via Telegram.</p>
                    </div>
                    {user.telegramConnected ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Connected
                        </span>
                    ) : (
                        <a 
                            href={`https://t.me/elegence_events_bot?start=${user.userId}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b3] transition-colors font-medium text-sm whitespace-nowrap"
                        >
                            Connect Telegram
                        </a>
                    )}
                </div>
            </div>

            {/* Section 3: Account Security */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-semibold text-slate-800">Account Security</h2>
                </div>
                <div className="p-6">
                    {!isChangingPassword ? (
                        <button 
                            onClick={() => setIsChangingPassword(true)}
                            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
                        >
                            Change Password
                        </button>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={passwordData.confirmNewPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">Update Password</button>
                                <button type="button" onClick={() => setIsChangingPassword(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium text-sm">Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Section 4: Request Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-800">Request Summary</h2>
                    <Link to="/requests" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        View all requests &rarr;
                    </Link>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-sm text-slate-500 font-medium mb-1">Total</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <p className="text-sm text-amber-600 font-medium mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4"/> Pending</p>
                        <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <p className="text-sm text-green-600 font-medium mb-1 flex items-center gap-1.5"><CheckCircle className="w-4 h-4"/> Approved</p>
                        <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <p className="text-sm text-red-600 font-medium mb-1 flex items-center gap-1.5"><XCircle className="w-4 h-4"/> Rejected</p>
                        <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
                    </div>
                </div>
            </div>

            {/* Section 5: Logout */}
            <div className="flex justify-center pt-4">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
