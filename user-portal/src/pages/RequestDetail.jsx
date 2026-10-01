import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestAPI, BASE_URL } from '../services/api';
import {
    ArrowLeft, Calendar, Tag, Clock, CheckCircle, XCircle,
    Download, User, Mail, Phone, MessageSquare, Send, Loader2,
    Sparkles, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────
   Status configuration (user-facing)
───────────────────────────────────── */
const STATUS_CONFIG = {
    'Pending':               { label: 'Under Review',      pill: 'bg-amber-100 text-amber-700 border-amber-300',    hero: 'from-amber-50 to-orange-50',   icon: Clock },
    'In Review':             { label: 'Under Review',      pill: 'bg-amber-100 text-amber-700 border-amber-300',    hero: 'from-amber-50 to-orange-50',   icon: Clock },
    'Quotation Sent':        { label: 'Quotation Ready',   pill: 'bg-blue-100 text-blue-700 border-blue-300',       hero: 'from-blue-50 to-indigo-50',    icon: Sparkles },
    'Approved':              { label: 'Approved',          pill: 'bg-emerald-100 text-emerald-700 border-emerald-300', hero: 'from-emerald-50 to-teal-50',  icon: CheckCircle },
    'Confirmed':             { label: 'Booking Confirmed', pill: 'bg-teal-100 text-teal-700 border-teal-300',        hero: 'from-teal-50 to-cyan-50',      icon: CheckCircle },
    'Rejected':              { label: 'Request Closed',    pill: 'bg-red-100 text-red-700 border-red-300',           hero: 'from-red-50 to-rose-50',       icon: XCircle },
    'Date Conflict':         { label: 'Date Conflict',     pill: 'bg-orange-100 text-orange-700 border-orange-300', hero: 'from-orange-50 to-red-50',      icon: AlertCircle },
    'Negotiation Requested': { label: 'Changes Requested', pill: 'bg-purple-100 text-purple-700 border-purple-300', hero: 'from-purple-50 to-violet-50',   icon: MessageSquare },
    'Pending Response':      { label: 'Admin Replied',     pill: 'bg-indigo-100 text-indigo-700 border-indigo-300', hero: 'from-indigo-50 to-blue-50',     icon: MessageSquare },
};

const getCfg = (status) => STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];

/* ─────────────────────────────────────
   NegotiationThread
───────────────────────────────────── */
const NegotiationThread = ({ messages }) => {
    if (!messages?.length) return null;
    return (
        <div className="space-y-3 py-1">
            {messages.map((msg, i) => {
                const isAdmin = msg.sender === 'admin';
                return (
                    <div key={i} className={`flex gap-3 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isAdmin ? 'bg-gray-200 text-gray-600' : 'bg-indigo-600 text-white'}`}>
                            {isAdmin ? 'A' : 'U'}
                        </div>
                        {/* Bubble */}
                        <div className={`max-w-[78%] ${isAdmin ? '' : ''}`}>
                            <div className={`rounded-2xl px-4 py-3 ${isAdmin ? 'bg-gray-100 text-gray-800 rounded-tl-sm' : 'bg-indigo-600 text-white rounded-tr-sm'}`}>
                                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isAdmin ? 'text-gray-400' : 'text-indigo-200'}`}>
                                    {isAdmin ? 'Admin' : 'You'}
                                </p>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            </div>
                            <p className={`text-[10px] text-gray-400 mt-1 ${isAdmin ? 'ml-1' : 'text-right mr-1'}`}>
                                {format(new Date(msg.timestamp), 'MMM d, h:mm a')}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ─────────────────────────────────────
   RequestDetail
───────────────────────────────────── */
const RequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // 'accept' | 'reject'
    const [showNegotiateBox, setShowNegotiateBox] = useState(false);
    const [negotiateText, setNegotiateText] = useState('');
    const [isSendingNegotiation, setIsSendingNegotiation] = useState(false);
    const threadEndRef = useRef(null);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const { data } = await requestAPI.getById(id);
                setRequest(data);
            } catch (err) {
                if (err.response?.status === 404) {
                    toast.error('Request not found');
                    navigate('/requests');
                }
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchRequest();
            const interval = setInterval(fetchRequest, 30000);
            return () => clearInterval(interval);
        }
    }, [id, user, navigate]);

    useEffect(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [request?.negotiationMessages?.length]);

    const handleAction = async (actionType) => {
        setActionLoading(actionType);
        try {
            const { data } = await requestAPI.updateAction(id, actionType);
            setRequest(data);
            toast.success(actionType === 'accept' ? '🎉 Booking confirmed!' : 'Request rejected.');
        } catch {
            toast.error(`Failed to ${actionType} request.`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleNegotiate = async () => {
        if (!negotiateText.trim()) return;
        setIsSendingNegotiation(true);
        try {
            const { data } = await requestAPI.negotiate(id, negotiateText.trim());
            setRequest(data);
            setNegotiateText('');
            setShowNegotiateBox(false);
            toast.success('Message sent to admin!');
        } catch {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsSendingNegotiation(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!request) return null;

    const cfg = getCfg(request.status);
    const StatusIcon = cfg.icon;
    const hasNegotiation = request.negotiationMessages?.length > 0;
    const canAct = ['Quotation Sent', 'Approved', 'Pending Response'].includes(request.status);
    const isFinal = request.status === 'Confirmed' || request.status === 'Rejected';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Hero header ── */}
            <div className={`bg-gradient-to-br ${cfg.hero} border-b border-gray-200`}>
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <Link to="/requests" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to My Requests
                    </Link>

                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                            request.status === 'Confirmed' ? 'bg-teal-500' :
                            request.status === 'Rejected'  ? 'bg-red-500'  :
                            request.status.includes('Negotiation') || request.status === 'Pending Response' ? 'bg-purple-500' :
                            'bg-indigo-600'
                        } text-white`}>
                            <StatusIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.pill}`}>
                                    {cfg.label}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">{request.requestId || request._id}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{request.title}</h1>
                            <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Submitted {format(new Date(request.createdAt), 'MMMM d, yyyy')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

                {/* Event Info Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Event Details</h2>
                    </div>
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Event Date</p>
                                <p className="font-semibold text-gray-900">{format(new Date(request.eventDate), 'MMM dd, yyyy')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Tag className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Category</p>
                                <p className="font-semibold text-gray-900">{request.category?.name || 'Service Request'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Booked by</p>
                                <p className="font-semibold text-gray-900">{request.user?.name}</p>
                                <p className="text-xs text-gray-400">{request.user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Description / Requirements</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{request.description}</p>
                    </div>
                </div>

                {/* Negotiation Thread Card */}
                {hasNegotiation && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-purple-500" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Messages</h2>
                            <span className="ml-auto text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                                {request.negotiationMessages.length}
                            </span>
                        </div>
                        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                            <NegotiationThread messages={request.negotiationMessages} />
                            <div ref={threadEndRef} />
                        </div>
                    </div>
                )}

                {/* Action Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Actions</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Quotation download - ALWAYS VISIBLE */}
                        {request.quotationUrl && (
                            <a
                                href={`${BASE_URL}${request.quotationUrl}`}
                                target="_blank" rel="noreferrer"
                                className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-700 hover:bg-indigo-50 transition-all"
                            >
                                <Download className="w-5 h-5" />
                                <div>
                                    <p className="font-semibold text-sm">Download Quotation PDF</p>
                                    <p className="text-xs text-indigo-500">Review the full quotation document</p>
                                </div>
                            </a>
                        )}

                        {/* FINAL STATE */}
                        {isFinal && (
                            <div className={`flex items-center gap-4 rounded-xl p-4 border ${
                                request.status === 'Confirmed'
                                    ? 'bg-teal-50 border-teal-200'
                                    : 'bg-red-50 border-red-200'
                            }`}>
                                {request.status === 'Confirmed'
                                    ? <CheckCircle className="w-8 h-8 text-teal-500 flex-shrink-0" />
                                    : <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                                }
                                <div>
                                    <p className={`font-bold text-base ${request.status === 'Confirmed' ? 'text-teal-800' : 'text-red-800'}`}>
                                        {request.status === 'Confirmed' ? 'Booking Confirmed!' : 'Request Closed'}
                                    </p>
                                    <p className={`text-sm mt-0.5 ${request.status === 'Confirmed' ? 'text-teal-600' : 'text-red-600'}`}>
                                        {request.status === 'Confirmed'
                                            ? 'Our team will reach out shortly with final details.'
                                            : 'This request has been declined. Feel free to submit a new one.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* NEGOTIATION WAITING */}
                        {!isFinal && request.status === 'Negotiation Requested' && (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <MessageSquare className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-purple-800">
                                        Your message has been sent to the admin. You'll be notified when they reply.
                                    </p>
                                </div>
                                {!showNegotiateBox && (
                                    <button onClick={() => setShowNegotiateBox(true)} className="flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                                        <Send className="w-4 h-4" /> Send another message
                                    </button>
                                )}
                            </div>
                        )}

                        {/* UNDER REVIEW */}
                        {!isFinal && ['Pending', 'In Review', 'Date Conflict'].includes(request.status) && (
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-amber-800">
                                    We're reviewing your request. You'll receive a notification once a quotation is ready.
                                </p>
                            </div>
                        )}

                        {/* CAN ACT: Accept / Reject / Request Changes */}
                        {canAct && !isFinal && (
                            <div className="space-y-4">
                                {/* Context message */}
                                <p className="text-sm text-gray-600">
                                    {request.status === 'Pending Response'
                                        ? 'The admin has replied to your request. Review their message above and choose how to proceed.'
                                        : 'Your event has been reviewed and is ready. Please confirm or decline to proceed.'}
                                </p>
                                {/* Primary action buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleAction('accept')}
                                        disabled={!!actionLoading}
                                        className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm shadow-emerald-200"
                                    >
                                        {actionLoading === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Accept & Confirm
                                    </button>
                                    <button
                                        onClick={() => handleAction('reject')}
                                        disabled={!!actionLoading}
                                        className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-red-50 border-2 border-red-200 hover:border-red-400 text-red-600 font-bold rounded-xl transition-colors"
                                    >
                                        {actionLoading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                        Decline
                                    </button>
                                </div>

                                {/* Request Changes toggle */}
                                {!showNegotiateBox && (
                                    <button
                                        onClick={() => setShowNegotiateBox(true)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-sm rounded-xl transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Request Changes
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Negotiate / send message compose box */}
                        {showNegotiateBox && (
                            <div className={`space-y-3 ${canAct ? 'mt-4 pt-4 border-t border-gray-100' : ''}`}>
                                <label className="text-sm font-semibold text-gray-700">
                                    {canAct ? 'Request Changes' : 'Send a Message'}
                                </label>
                                <textarea
                                    rows={4}
                                    value={negotiateText}
                                    onChange={e => setNegotiateText(e.target.value)}
                                    placeholder="Describe the changes you'd like or ask a question…"
                                    className="w-full text-sm p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none bg-gray-50"
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleNegotiate}
                                        disabled={isSendingNegotiation || !negotiateText.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
                                    >
                                        {isSendingNegotiation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Send Message
                                    </button>
                                    <button
                                        onClick={() => { setShowNegotiateBox(false); setNegotiateText(''); }}
                                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Admin notes */}
                        {request.adminNotes && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Note from Admin</p>
                                <p className="text-sm text-amber-800 italic">{request.adminNotes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
