import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Loader2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../services/api';

const STATUS_CONFIG = {
  'Pending':               { label: 'Pending',               color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  'In Review':             { label: 'In Review',             color: 'bg-blue-100 text-blue-800 border-blue-200',   dot: 'bg-blue-500' },
  'Quotation Sent':        { label: 'Quotation Sent',        color: 'bg-indigo-100 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
  'Approved':              { label: 'Approved',              color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  'Confirmed':             { label: 'Confirmed',             color: 'bg-teal-100 text-teal-800 border-teal-200',   dot: 'bg-teal-500' },
  'Rejected':              { label: 'Rejected',              color: 'bg-red-100 text-red-800 border-red-200',       dot: 'bg-red-500' },
  'Date Conflict':         { label: 'Date Conflict',         color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  'Negotiation Requested': { label: 'Negotiation',           color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  'Pending Response':      { label: 'Pending Response',      color: 'bg-indigo-100 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
};

const getStatusCfg = (status) => STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', dot: 'bg-gray-400' };

const StatusBadge = ({ status, pulse = false }) => {
  const cfg = getStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${pulse ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
};

const Requests = () => {
  const navigate = useNavigate();
  const [requests, setRequests]           = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeFilter, setActiveFilter]   = useState('All');
  const [searchQuery, setSearchQuery]     = useState('');

  const FILTER_TABS = ['All', 'Pending', 'In Review', 'Quotation Sent', 'Negotiation', 'Approved', 'Confirmed', 'Rejected', 'Date Conflict'];

  useEffect(() => { 
    fetchRequests(); 
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = [...requests];
    if (activeFilter !== 'All') {
      if (activeFilter === 'Negotiation') {
        result = result.filter(r => r.status === 'Negotiation Requested' || r.status === 'Pending Response');
      } else {
        result = result.filter(r => r.status === activeFilter);
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.requestId?.toLowerCase().includes(q) ||
        r.user?.name?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [requests, activeFilter, searchQuery]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/requests`, { withCredentials: true });
      const sorted = res.data.sort((a, b) => {
        const priority = ['Negotiation Requested', 'Pending Response'];
        const ap = priority.includes(a.status) ? 0 : 1;
        const bp = priority.includes(b.status) ? 0 : 1;
        if (ap !== bp) return ap - bp;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setRequests(sorted);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const negotiationCount = requests.filter(r => r.status === 'Negotiation Requested' || r.status === 'Pending Response').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Request Management</h1>
          <p className="text-gray-500 mt-1">Review and manage all incoming event requests.</p>
        </div>
        {negotiationCount > 0 && (
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-800 text-sm font-semibold px-4 py-2 rounded-xl">
            <MessageSquare className="w-4 h-4" />
            {negotiationCount} negotiation{negotiationCount > 1 ? 's' : ''} pending
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
          <div className="flex justify-between items-center gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title, ID or client..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeFilter === tab
                    ? tab === 'Negotiation'
                      ? 'bg-purple-600 text-white'
                      : 'bg-amber-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-400'
                }`}
              >
                {tab}
                {tab === 'Negotiation' && negotiationCount > 0 && (
                  <span className="ml-1.5 bg-purple-200 text-purple-800 rounded-full px-1.5 py-0.5 text-[10px]">
                    {negotiationCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Request ID</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Event</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Client</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Category</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Event Date</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-16 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />Loading...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-16 text-center text-gray-400">No requests found.</td></tr>
              ) : (
                filtered.map((req) => {
                  const isNegotiation = req.status === 'Negotiation Requested' || req.status === 'Pending Response';
                  return (
                    <tr
                      key={req._id}
                      onClick={() => navigate(`/requests/${req._id}`)}
                      className={`hover:bg-gray-50/70 transition-colors cursor-pointer ${isNegotiation ? 'bg-purple-50/40' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-600">{(req.requestId || req._id).substring(0, 12)}…</span>
                          <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(req.requestId || req._id); toast.success('Copied!'); }}>
                            <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          {isNegotiation && <MessageSquare className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />}
                          {req.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{req.user?.name || '—'}</div>
                        <div className="text-xs text-gray-400">{req.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{req.category?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium text-sm">
                        {req.eventDate ? format(new Date(req.eventDate), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} pulse={req.status === 'Negotiation Requested'} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline">
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Requests;
