import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-white font-sans text-gray-800"
    >
      {/* Header */}
      <div className="bg-gray-900 pt-32 pb-24 border-b border-gray-800 text-center flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 mb-6">
          <span className="text-sm font-medium text-amber-400 tracking-wide uppercase">Who We Are</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">Our Story</h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Founded on the belief that every celebration deserves to be exceptional, Elegance Events turns fleeting moments into lifelong memories.
        </p>
      </div>

      {/* Main Story Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
             <div className="absolute -inset-4 bg-gray-100 rounded-3xl -z-10 transform -rotate-3"></div>
            <img 
              src="https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&q=80" 
              alt="Team at work" 
              className="rounded-2xl shadow-xl w-full h-[600px] object-cover"
            />
          </div>
          <div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-8">Crafting Excellence Since 2010</h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              What started as a boutique wedding planning service has blossomed into a full-scale, luxury event management powerhouse. At Elegance Events, we blend meticulous organization with boundless creativity to deliver events that are completely unique to you.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Our philosophy is simple: You should feel like a guest at your own event. We take on the heavy lifting—from contract negotiations and vendor sourcing to on-the-day crisis management—so you don't have to.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              With a diverse team of designers, logistic experts, and hospitality veterans, we possess the comprehensive skill set required to execute flawless events, whether for 50 people or 5,000.
            </p>
            
            <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-10">
              <div>
                <h4 className="text-5xl font-serif font-bold text-amber-600 mb-2">500+</h4>
                <p className="text-gray-500 font-medium uppercase tracking-wide text-sm">Events Executed</p>
              </div>
              <div>
                <h4 className="text-5xl font-serif font-bold text-amber-600 mb-2">15</h4>
                <p className="text-gray-500 font-medium uppercase tracking-wide text-sm">Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Team Placeholder */}
      <section className="py-24 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-16">Meet The Leadership</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {/* Member 1 */}
               <div>
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80" alt="CEO" className="w-48 h-48 rounded-full mx-auto object-cover mb-6 shadow-lg" />
                  <h3 className="text-2xl font-bold text-gray-900">Sarah Jenkins</h3>
                  <p className="text-amber-600 font-medium mb-4">Founder & CEO</p>
                  <p className="text-gray-600">With over 20 years in luxury hospitality, Sarah brings unparalleled vision to every project.</p>
               </div>
               {/* Member 2 */}
               <div>
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80" alt="Creative Director" className="w-48 h-48 rounded-full mx-auto object-cover mb-6 shadow-lg" />
                  <h3 className="text-2xl font-bold text-gray-900">Michael Chang</h3>
                  <p className="text-amber-600 font-medium mb-4">Creative Director</p>
                  <p className="text-gray-600">Michael's background in theatrical set design ensures every event is visually spectacular.</p>
               </div>
               {/* Member 3 */}
               <div>
                  <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80" alt="Director of Ops" className="w-48 h-48 rounded-full mx-auto object-cover mb-6 shadow-lg" />
                  <h3 className="text-2xl font-bold text-gray-900">Elena Rodriguez</h3>
                  <p className="text-amber-600 font-medium mb-4">VP of Operations</p>
                  <p className="text-gray-600">The logistical mastermind who makes sure everything runs exactly on schedule.</p>
               </div>
            </div>
         </div>
      </section>
    </motion.div>
  );
};

export default About;
