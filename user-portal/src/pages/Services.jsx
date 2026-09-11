import { useEffect, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/categories?active=true`);
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch services', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-white font-sans text-gray-800"
    >
      <div className="bg-gray-900 pt-32 pb-24 text-center flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 mb-6">
          <span className="text-sm font-medium text-amber-400 tracking-wide uppercase">What We Do</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">Our Services</h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto px-4 leading-relaxed">
          Comprehensive planning, design, and elite production for events of all scales and complexities.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {services.map((service, idx) => (
            <div key={service.categoryId} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow group flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={service.img} 
                  alt={service.name} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {service.subtitle}
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-slate-600 mb-6 flex-grow">{service.description}</p>
                
                <Link 
                  to={`/services/${service.categoryId}`} 
                  className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors group/link mt-auto"
                >
                  View Details
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Services;
