import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Plus, Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
    'New': { label: 'Under review', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    'In Review': { label: 'Under review', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    'Quotation Sent': { label: 'Quotation ready', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    'Approved': { label: 'Confirmed', color: 'bg-green-100 text-green-700 border-green-200' },
    'Confirmed': { label: 'Confirmed', color: 'bg-green-100 text-green-700 border-green-200' },
    'Rejected': { label: 'Closed', color: 'bg-red-100 text-red-700 border-red-200' },
};

const MyRequests = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user?.token}` } };
                // using /api/requests/my as requested
                const { data } = await axios.get('/api/requests/my', config);
                // Sort newest first
                const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRequests(sorted);
            } catch (error) {
                console.error("Error fetching requests", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRequests();
        }
    }, [user]);

    const tabs = ['All', 'Under review', 'Quotation ready', 'Confirmed', 'Closed'];

    const filteredRequests = requests.filter(req => {
        if (activeTab === 'All') return true;
        const config = statusConfig[req.status] || statusConfig['New'];
        return config.label === activeTab;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">My Requests</h1>
                    <p className="text-slate-500 mt-1">Track and manage your event service requests</p>
                </div>

            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 hide-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                                ? 'bg-slate-800 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Request List */}
            {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No requests found</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        {activeTab === 'All'
                            ? "You haven't submitted any event requests yet. Create your first request to get started."
                            : `You don't have any requests in the "${activeTab}" status.`}
                    </p>
                    {activeTab === 'All' && (
                        <Link
                            to="/requests/new"
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-white border-2 border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            Create First Request
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredRequests.map(request => {
                        const sConf = statusConfig[request.status] || statusConfig['New'];
                        return (
                            <div
                                key={request.requestId || request._id}
                                onClick={() => navigate(`/requests/${request.requestId || request._id}`)}
                                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="space-y-2 flex-grow">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {request.title}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sConf.color}`}>
                                                {sConf.label}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(request.eventDate), 'MMM dd, yyyy')}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                Submitted {format(new Date(request.createdAt), 'MMM dd')}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                                                {request.category?.name || 'Service Request'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyRequests;
