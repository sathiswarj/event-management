import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, X, Check, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Action Modal State
  const [actionModal, setActionModal] = useState({ show: false, request: null, status: '', message: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests', { withCredentials: true });
      setRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (req, status) => {
    setActionModal({ show: true, request: req, status, message: '' });
  };

  const submitUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      await axios.put(`http://localhost:5000/api/requests/${actionModal.request._id}`, { 
        status: actionModal.status, 
        adminNotes: actionModal.message 
      }, { withCredentials: true });
      
      toast.success(`Request ${actionModal.status} successfully`);
      setActionModal({ show: false, request: null, status: '', message: '' });
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update request');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStatusSimple = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/requests/${id}`, { status }, { withCredentials: true });
      toast.success(`Status updated to ${status}`);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Request Management</h1>
          <p className="text-gray-500 mt-1">Review and manage all incoming event requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>
          <button className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Event Title</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Date Submitted</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading requests...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No requests found.</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedRequest(req)}>
                    <td className="px-6 py-4 font-medium text-gray-900">{req.title}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div>{req.customerName}</div>
                      <div className="text-xs text-gray-400">{req.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{req.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }}>
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRequest(null)} />
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-serif font-bold text-gray-900">Request Details</h2>
              <button onClick={() => setSelectedRequest(null)} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedRequest.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Client Information</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="font-medium text-gray-900">{selectedRequest.customerName}</p>
                    <p className="text-gray-600 text-sm mt-1">{selectedRequest.customerEmail}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Event Category</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="font-medium text-gray-900">{selectedRequest.category?.name || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Event Vision / Description</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedRequest.description}</p>
                  </div>
                </div>

                {selectedRequest.adminNotes && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Admin Feedback</h4>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <p className="text-amber-900 text-sm italic">{selectedRequest.adminNotes}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Submission Date</h4>
                  <p className="text-gray-900 font-medium">{format(new Date(selectedRequest.createdAt), 'MMMM dd, yyyy - h:mm a')}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 text-center">Update Status</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => confirmAction(selectedRequest, 'Approved')}
                  className="flex items-center justify-center py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </button>
                <button 
                  onClick={() => confirmAction(selectedRequest, 'Rejected')}
                  className="flex items-center justify-center py-3 bg-white border border-gray-200 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors shadow-sm"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </button>
              </div>
              <button 
                onClick={() => updateStatusSimple(selectedRequest._id, 'Completed')}
                className="w-full flex items-center justify-center py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors shadow-sm mt-2"
              >
                Mark as Completed
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Action Message Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActionModal({ ...actionModal, show: false })} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Confirm {actionModal.status}
              </h3>
              <button onClick={() => setActionModal({ ...actionModal, show: false })} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              You are about to mark this request as <strong className="text-gray-900">{actionModal.status}</strong>. 
              Would you like to include an internal note or a message?
            </p>

            <textarea
              rows="4"
              placeholder={`Enter reason for ${actionModal.status.toLowerCase()}... (Optional)`}
              value={actionModal.message}
              onChange={(e) => setActionModal({ ...actionModal, message: e.target.value })}
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm resize-none mb-6"
            ></textarea>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setActionModal({ ...actionModal, show: false })}
                className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitUpdateStatus}
                disabled={isUpdating}
                className={`px-4 py-2 font-bold text-white rounded-lg transition-colors shadow-sm ${
                  actionModal.status === 'Approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isUpdating ? 'Saving...' : `Confirm ${actionModal.status}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Requests;
