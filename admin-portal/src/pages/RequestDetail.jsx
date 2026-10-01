import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Calendar, Tag, Clock, CheckCircle, XCircle, ChevronDown, Check,
  Download, User, Mail, Phone, MessageSquare, Send, Loader2, Upload, AlertCircle, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import requestService from '../services/requestService';
import ChatPanel from './ChatPanel';

const STATUS_CONFIG = {
  'Pending': { label: 'Pending', pill: 'bg-amber-100 text-amber-700 border-amber-300', hero: 'from-amber-50 to-orange-50', icon: Clock },
  'In Review': { label: 'In Review', pill: 'bg-blue-100 text-blue-700 border-blue-300', hero: 'from-blue-50 to-indigo-50', icon: Clock },
  'Quotation Sent': { label: 'Quotation Sent', pill: 'bg-indigo-100 text-indigo-700 border-indigo-300', hero: 'from-indigo-50 to-blue-50', icon: FileText },
  'Approved': { label: 'Approved', pill: 'bg-emerald-100 text-emerald-700 border-emerald-300', hero: 'from-emerald-50 to-teal-50', icon: CheckCircle },
  'Confirmed': { label: 'Booking Confirmed', pill: 'bg-teal-100 text-teal-700 border-teal-300', hero: 'from-teal-50 to-cyan-50', icon: CheckCircle },
  'Rejected': { label: 'Request Closed', pill: 'bg-red-100 text-red-700 border-red-300', hero: 'from-red-50 to-rose-50', icon: XCircle },
  'Date Conflict': { label: 'Date Conflict', pill: 'bg-orange-100 text-orange-700 border-orange-300', hero: 'from-orange-50 to-red-50', icon: AlertCircle },
  'Negotiation Requested': { label: 'Negotiation', pill: 'bg-purple-100 text-purple-700 border-purple-300', hero: 'from-purple-50 to-violet-50', icon: MessageSquare },
  'Pending Response': { label: 'Pending Response', pill: 'bg-indigo-100 text-indigo-700 border-indigo-300', hero: 'from-indigo-50 to-blue-50', icon: MessageSquare },
};

const getCfg = (status) => STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];


const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fileInputRef = useRef(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const threadEndRef = useRef(null);

  const fetchRequest = async () => {
    try {
      const { data } = await requestService.getRequestById(id);
      setRequest(data);
    } catch (err) {
      toast.error('Failed to load request');
      navigate('/requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
    const interval = setInterval(fetchRequest, 30000);
    return () => clearInterval(interval);
  }, [id, navigate]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [request?.negotiationMessages?.length]);

  const updateStatusSimple = async (status) => {
    try {
      await requestService.updateRequestStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchRequest();
    } catch {
      toast.error('Failed to update request');
    }
  };

  const sendAdminReply = async (msgText) => {
    const textToSend = typeof msgText === 'string' ? msgText : replyText;
    if (!textToSend.trim()) return;
    setIsSendingReply(true);
    try {
      await requestService.sendAdminReply(id, textToSend.trim());
      setReplyText('');
      toast.success('Reply sent');
      fetchRequest();
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const submitQuotation = async () => {
    if (!selectedPdf) return;

    setIsUploadingPdf(true);
    const formData = new FormData();
    formData.append('quotation', selectedPdf);

    try {
      await requestService.sendQuotation(id, formData);
      toast.success('Quotation sent to user successfully!');
      setSelectedPdf(null);
      fetchRequest();
    } catch (err) {
      console.error("Upload error:", err.response || err);
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploadingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }
  if (!request) return null;

  const cfg = getCfg(request.status);
  const StatusIcon = cfg.icon;
  const isNegotiation = request.status === 'Negotiation Requested' || request.status === 'Pending Response';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className={`bg-gradient-to-br ${cfg.hero} border-b border-gray-200`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link to="/requests" className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors text-sm font-medium mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Requests
          </Link>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${request.status === 'Confirmed' ? 'text-teal-500' :
                request.status === 'Rejected' ? 'text-red-500' :
                  isNegotiation ? 'text-purple-500' : 'text-amber-500'
              }`} />
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.pill}`}>{cfg.label}</span>
            <span className="text-xs text-gray-400 font-mono">{request.requestId || request._id}</span>
          </div>

          <div className="flex flex-row items-center justify-between gap-4 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{request.title}</h1>

            {/* Admin Actions moved to Header */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {request.status === 'Approved' || request.status === 'Rejected' ? (
                <div className={`px-4 py-2 rounded-full border ${request.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  <p className="font-bold text-sm flex items-center gap-2">
                    {request.status === 'Approved' ? <CheckCircle className="w-4 h-4" /> : null}
                    {request.status === 'Approved' ? 'Request Approved' : 'Request Closed'}
                  </p>
                </div>
              ) : request.status === 'Confirmed' ? (
                <button
                  onClick={() => updateStatusSimple('Approved')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Final Booking
                </button>
              ) : (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-between gap-2 bg-white border border-gray-200 hover:border-amber-400 text-gray-900 text-sm font-medium rounded-xl px-4 py-2.5 transition-all shadow-sm w-72"
                    >
                      <span>{request.status}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-20">
                        {['Pending', 'In Review', 'Approved', 'Rejected'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => { setIsDropdownOpen(false); if (opt !== request.status) updateStatusSimple(opt); }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2 transition-colors"
                          >
                            {request.status === opt ? <Check className="w-4 h-4" /> : <span className="w-4" />}
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input type="file" accept="application/pdf" ref={fileInputRef} onChange={(e) => setSelectedPdf(e.target.files[0])} className="hidden" />
                  <div className="flex flex-col items-center relative">
                    {selectedPdf ? (
                      <button
                        onClick={submitQuotation}
                        disabled={isUploadingPdf}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                      >
                        {isUploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Quotation
                      </button>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPdf}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                      >
                        <Upload className="w-4 h-4" />
                        {request.quotationUrl ? 'Update Quotation PDF' : 'Upload Quotation'}
                      </button>
                    )}

                    {request.quotationUrl && !selectedPdf && (
                      <a href={`http://localhost:5000${request.quotationUrl}`} target="_blank" rel="noreferrer" className="absolute top-full flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-indigo-600 hover:underline bg-white/50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        View current PDF <Download className="w-3 h-3" />
                      </a>
                    )}
                    {selectedPdf && (
                      <button onClick={() => { setSelectedPdf(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-full text-[11px] text-gray-500 hover:text-red-500 mt-1.5 underline whitespace-nowrap">
                        Cancel ({selectedPdf.name})
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Submitted {format(new Date(request.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: 3 Boxes + Negotiation */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Event Details</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Event Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(request.eventDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Category</p>
                  <p className="font-semibold text-gray-900">{request.category?.name || 'Service Request'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Description</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{request.description}</p>
            </div>
          </div>



          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Client Info</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Name</p>
                  <p className="font-semibold text-gray-900">{request.user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Email</p>
                  <p className="font-semibold text-gray-900">{request.user?.email}</p>
                </div>
              </div>
              {request.user?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Phone</p>
                    <p className="font-semibold text-gray-900">{request.user?.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>


        </div>

        {/* Right Column: Negotiation Panel */}
        <div className="h-full">
          <ChatPanel 
            mode="negotiation"
            negotiationMessages={request.negotiationMessages}
            onSendReply={sendAdminReply}
            isSendingReply={isSendingReply}
          />
        </div>

        {/* Bottom Section: Status Timeline spanning both columns */}
        {request.statusHistory && request.statusHistory.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Status Timeline</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {request.statusHistory.map((history, idx) => {
                  const statusCfg = getCfg(history.status);
                  const Icon = statusCfg.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 shadow-sm flex flex-col space-y-3 relative overflow-hidden">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusCfg.pill}`}>
                         <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{history.status}</p>
                        <p className="text-xs text-gray-500 mt-1">{format(new Date(history.updatedAt), 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-gray-400">{format(new Date(history.updatedAt), 'h:mm a')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetail;
