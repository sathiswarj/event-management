import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

const RequestManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { admin } = useSelector((state) => state.auth);
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) {
      navigate('/login');
    }

    const fetchRequests = async () => {
      try {
        const config = {
          withCredentials: true,
        };
        const res = await axios.get('http://localhost:5000/api/requests', config);
        setRequests(res.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch requests');
        setLoading(false);
      }
    };

    fetchRequests();
    
    return () => {
      dispatch(reset());
    }
  }, [admin, navigate, dispatch]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const config = {
        withCredentials: true,
      };
      await axios.put(`http://localhost:5000/api/requests/${id}`, { status: newStatus }, config);
      setRequests((prev) => prev.map((req) => req._id === id ? { ...req, status: newStatus } : req));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">{admin?.email}</span>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Request Management</h2>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <li key={req._id}>
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-blue-600 truncate">{req.title}</p>
                        <p className="text-sm text-gray-500 mt-1">From: {req.customerName} ({req.customerEmail})</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            req.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                            req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {req.status}
                        </span>
                        
                        <select 
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-50"
                          value={req.status}
                          onChange={(e) => handleStatusChange(req._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </li>
                ))}
                {requests.length === 0 && (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No requests found.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RequestManagement;
