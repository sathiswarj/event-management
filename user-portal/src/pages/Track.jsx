import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../services/api';

const Track = () => {
  const { leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/requests/${leadId}`);
        setLead(res.data);
      } catch (err) {
        console.error('Error fetching lead status:', err);
        setError('Unable to fetch application progress. Please verify your tracking ID.');
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [leadId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mt-4"></div>
          <div className="mt-16 space-y-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-gray-900">Status Not Found</h2>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const status = lead?.status || 'New';

  const steps = [
    { title: 'Analysis Initialized', completed: true, active: status === 'New' },
    { title: 'Reviewing Matrix', completed: status === 'Approved' || status === 'Rejected', active: status === 'In Review' },
    { title: status === 'Rejected' ? 'Matrix Conflict' : 'Proposal Confirmed', completed: status === 'Approved', active: status === 'Approved' || status === 'Rejected', rejected: status === 'Rejected' },
  ];

  const renderMessageCard = () => {
    if (status === 'New') {
      return (
        <div className="mt-12 bg-[#F9F6EE] border border-[#E5DFD3] p-8 rounded-xl shadow-sm">
          <p className="text-[#8C7B50] font-medium text-lg leading-relaxed text-center">
            "Your application data has been logged. We are currently waiting for our elite planning desk to begin their first review."
          </p>
        </div>
      );
    }
    if (status === 'In Review') {
      return (
        <div className="mt-12 bg-[#EFF6FF] border border-[#BFDBFE] p-8 rounded-xl shadow-sm">
          <p className="text-[#1E40AF] font-medium text-lg leading-relaxed text-center">
            "Our admin desk is actively inspecting your budget math, guest count, and theme parameters to build your proposal."
          </p>
        </div>
      );
    }
    if (status === 'Approved') {
      return (
        <div className="mt-12 bg-[#E8F5EE] border border-[#A7F3D0] p-8 rounded-xl shadow-sm">
          <p className="text-[#065F46] font-medium text-lg leading-relaxed text-center">
            "Proposal Confirmed! Your designated date matrix is securely locked. Watch your device—our automated desk is dispatching your custom proposal via WhatsApp."
          </p>
        </div>
      );
    }
    if (status === 'Rejected') {
      return (
        <div className="mt-12 bg-[#FEF2F2] border border-[#FECACA] p-8 rounded-xl shadow-sm">
          <p className="text-[#991B1B] font-medium text-lg leading-relaxed text-center">
            "Date Matrix Conflict. The requested calendar dates are currently fully committed. Our concierge desk will contact you within 24 hours with curated alternative horizons."
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-20 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#064E3B] tracking-tight">Application Status</h1>
          <p className="mt-4 text-[#8C7B50] text-lg uppercase tracking-widest text-sm font-semibold">
            Tracking ID: <span className="font-mono text-[#064E3B]">{leadId.substring(0,8).toUpperCase()}</span>
          </p>
          {lead?.eventDate && (
            <p className="mt-2 text-[#8C7B50] text-sm uppercase tracking-widest font-semibold">
              Requested Date: <span className="text-[#064E3B]">{format(new Date(lead.eventDate), 'MMMM dd, yyyy - h:mm a')}</span>
            </p>
          )}
        </div>

        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-[#E5DFD3]" />

          <div className="space-y-12">
            {steps.map((step, index) => {
              const isCompleted = step.completed;
              const isActive = step.active;
              const isRejectedNode = step.rejected;
              
              let nodeColor = 'bg-white border-[#E5DFD3] text-gray-400';
              if (isCompleted && !isRejectedNode) nodeColor = 'bg-[#10B981] border-[#10B981] text-white';
              else if (isActive && !isRejectedNode) nodeColor = 'bg-white border-[#10B981] text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse border-2';
              else if (isRejectedNode) nodeColor = 'bg-[#DC2626] border-[#DC2626] text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]';

              return (
                <div key={index} className="relative flex items-start group">
                  <div className={`z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${nodeColor} shrink-0`}>
                    {isCompleted && !isRejectedNode ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : isRejectedNode ? (
                      <AlertCircle className="w-6 h-6" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-8 pt-2">
                    <h3 className={`text-xl font-serif font-semibold ${isRejectedNode ? 'text-[#DC2626]' : isActive || isCompleted ? 'text-[#064E3B]' : 'text-gray-400'}`}>
                      {step.title}
                    </h3>
                    {index === 0 && (
                      <p className="mt-2 text-gray-500 text-sm">Your event requirements have been securely logged.</p>
                    )}
                    {index === 1 && (
                      <p className="mt-2 text-gray-500 text-sm">Evaluating availability and required resources.</p>
                    )}
                    {index === 2 && (
                      <p className="mt-2 text-gray-500 text-sm">Final decision on requested dates and scope.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {renderMessageCard()}
      </div>
    </div>
  );
};

export default Track;
