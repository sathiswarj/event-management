import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gray-50"
    >
      <div className="bg-gray-900 py-24 text-center flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 mb-6">
          <span className="text-sm font-medium text-amber-400 tracking-wide uppercase">Get In Touch</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">Contact Us</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto px-4">We'd love to hear from you. Reach out to discuss how we can make your next event extraordinary.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-slate-100 flex flex-col justify-center">
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-8">Contact Information</h3>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Our Office</h4>
                  <p className="mt-1 text-gray-600">123 Elegance Boulevard<br/>Beverly Hills, CA 90210</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600">
                    <Phone className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Phone</h4>
                  <p className="mt-1 text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600">
                    <Mail className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Email</h4>
                  <p className="mt-1 text-gray-600">hello@eleganceevents.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Business Hours</h4>
                  <p className="mt-1 text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM<br/>Sat - Sun: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder or additional info */}
          <div className="bg-gray-200 rounded-2xl shadow-xl overflow-hidden h-[500px] relative">
             <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col">
                <MapPin className="h-12 w-12 text-gray-400 mb-2" />
                <p className="font-medium text-lg">Interactive Map</p>
                <p className="text-sm">Location visualization goes here</p>
             </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
