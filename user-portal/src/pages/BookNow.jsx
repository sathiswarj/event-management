import { useState, useEffect } from 'react';
import { categoryAPI, requestAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const BookNow = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    eventDate: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getActive();
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: res.data[0].categoryId }));
        }
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestAPI.create(formData);
      toast.success('Your request has been successfully submitted! Our team will contact you shortly.');
      setFormData({ title: '', description: '', categoryId: categories[0]?.categoryId || '', eventDate: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gray-50"
    >
      <div className="bg-gray-900 py-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 mb-6">
          <span className="text-sm font-medium text-amber-400 tracking-wide uppercase">Book Your Event</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Book Now</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto px-4">Start planning your next unforgettable event today.</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-10">
          <form onSubmit={onSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input type="text" name="title" required value={formData.title} onChange={onChange} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-amber-500 transition-colors bg-transparent" placeholder="e.g. Annual Tech Gala 2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date & Time</label>
                <input type="datetime-local" name="eventDate" required value={formData.eventDate} onChange={onChange} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-amber-500 transition-colors bg-transparent text-gray-700" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={onChange} required className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-amber-500 transition-colors bg-transparent">
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Details & Vision</label>
              <textarea name="description" required rows="4" value={formData.description} onChange={onChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 transition-colors bg-transparent mt-2" placeholder="Tell us about your event scale, preferred dates, and overall vision..."></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 px-6 border border-transparent rounded-full shadow-sm text-base font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors">
              {loading ? 'Sending Request...' : 'Submit Booking Request'}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default BookNow;
