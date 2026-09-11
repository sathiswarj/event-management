import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/categories/${id}`);
        setService(data);
      } catch (error) {
        console.error('Failed to fetch service', error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Service Not Found</h2>
        <Link to="/services" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to Services
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="bg-white font-sans min-h-screen pb-24"
    >
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] bg-slate-900">
        <div className="absolute inset-0">
          <img 
            src={service.img} 
            alt={service.name} 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16">
          <Link to="/services" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-8 transition-colors text-sm font-medium uppercase tracking-widest w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-bold tracking-wider uppercase mb-4">
              {service.subtitle}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight max-w-4xl">
              {service.name}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-6">About This Service</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {service.longDesc}
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-100">
              <h3 className="text-2xl font-serif font-bold text-slate-800 mb-6">What's Included</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {service.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start text-slate-700">
                    <Check className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Ready to start planning?</h3>
              <p className="text-slate-600 mb-6">
                Let our expert team handle every detail of your {service.name.toLowerCase()}.
              </p>
              <Link 
                to="/book" 
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-medium transition-colors shadow-md"
              >
                <Calendar className="w-5 h-5" />
                Book Consultation
              </Link>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-2">Have Questions?</p>
              <p className="text-lg font-bold text-slate-800">Call Us: (555) 123-4567</p>
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceDetail;
