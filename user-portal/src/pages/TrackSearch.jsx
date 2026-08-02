import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const TrackSearch = () => {
  const [trackingId, setTrackingId] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/track/${trackingId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-2xl text-center"
      >
        <div className="bg-white p-10 md:p-14 rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-100">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-100">
            <Compass className="w-8 h-8 text-amber-600" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight mb-4">
            Locate Your Event
          </h1>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed max-w-lg mx-auto">
            Enter your unique Tracking ID to view the live status of your application, proposal matrix, and event horizon.
          </p>

          <form onSubmit={handleTrack} className="relative max-w-md mx-auto">
            <div className="relative flex items-center group">
              <Search className="absolute left-5 text-gray-400 group-focus-within:text-amber-500 transition-colors w-6 h-6" />
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter Tracking ID..."
                className="w-full pl-14 pr-32 py-5 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all font-mono tracking-wide"
                required
              />
              <button 
                type="submit" 
                className="absolute right-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-amber-600/20"
              >
                Track
              </button>
            </div>
          </form>
          
          <p className="mt-8 text-sm text-gray-400 font-medium">
            Lost your Tracking ID? <a href="/contact" className="text-amber-600 hover:underline">Contact our concierge.</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TrackSearch;
