import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, Calendar, FileText, CheckCircle, XCircle, Download, User, Mail, Phone, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusConfig = {
    'New': { label: 'Under review', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    'In Review': { label: 'Under review', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    'Quotation Sent': { label: 'Quotation ready', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    'Approved': { label: 'Confirmed', color: 'bg-green-100 text-green-700 border-green-200' },
    'Confirmed': { label: 'Confirmed', color: 'bg-green-100 text-green-700 border-green-200' },
    'Rejected': { label: 'Closed', color: 'bg-red-100 text-red-700 border-red-200' },
};

const RequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user?.token}` } };
                const { data } = await axios.get(`/api/requests/${id}`, config);
                setRequest(data);
            } catch (error) {
                console.error("Error fetching request detail", error);
                if (error.response?.status === 404) {
                    toast.error('Request not found');
                    navigate('/requests');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRequest();
        }
    }, [id, user, navigate]);

    const handleAction = async (actionType) => {
        setActionLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            // POST to /api/requests/:id/accept or /reject
            const { data } = await axios.post(`/api/requests/${id}/${actionType}`, {}, config);
            setRequest({ ...request, status: data.status });
            toast.success(`Request ${actionType === 'accept' ? 'Confirmed' : 'Rejected'} successfully`);
        } catch (error) {
            toast.error(`Failed to ${actionType} request`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
        );
    }

    if (!request) return null;

    const sConf = statusConfig[request.status] || statusConfig['New'];
    const isQuotationReady = request.status === 'Quotation Sent';
    const isFinalState = request.status === 'Confirmed' || request.status === 'Approved' || request.status === 'Rejected';

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/requests" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to My Requests
            </Link>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${sConf.color}`}>
                                {sConf.label}
                            </span>
                            <span className="text-slate-400 text-sm">ID: {request.requestId || request._id}</span>
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Submitted on {format(new Date(request.createdAt), 'MMMM dd, yyyy')}
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{request.title}</h1>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Event Details</h3>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4"/> Event Date</p>
                                    <p className="font-medium text-slate-800">{format(new Date(request.eventDate), 'MMMM dd, yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5"><FileText className="w-4 h-4"/> Category</p>
                                    <p className="font-medium text-slate-800">{request.category?.name || 'Service Request'}</p>
                                </div>
                                {request.expectedGuests && (
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5"><User className="w-4 h-4"/> Expected Guests</p>
                                        <p className="font-medium text-slate-800">{request.expectedGuests}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Description / Requirements</h3>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{request.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions & Contact */}
                    <div className="space-y-6">
                        {/* Action Box */}
                        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                            <h3 className="font-semibold text-indigo-900 mb-2">Request Status</h3>
                            
                            {isQuotationReady ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-indigo-700">Your quotation is ready for review.</p>
                                    
                                    {request.quotationUrl && (
                                        <a 
                                            href={request.quotationUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="w-full flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Quotation
                                        </a>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            onClick={() => handleAction('accept')}
                                            disabled={actionLoading}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => handleAction('reject')}
                                            disabled={actionLoading}
                                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ) : isFinalState ? (
                                <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-white bg-opacity-60 border border-indigo-100">
                                    {request.status === 'Rejected' ? (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                    <span className="font-medium text-slate-800">
                                        Request {request.status === 'Rejected' ? 'Closed' : 'Confirmed'}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-sm text-indigo-700">We are currently reviewing your request. We'll notify you once a quotation is ready.</p>
                            )}
                        </div>

                        {/* Contact Details */}
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Contact Details</h3>
                            <div className="space-y-3 bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <p className="text-sm text-slate-700">{request.customerName}</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <p className="text-sm text-slate-700">{request.customerEmail}</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <p className="text-sm text-slate-700">{request.customerPhone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
