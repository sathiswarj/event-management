import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Services = () => {
  const services = [
    {
      title: 'Corporate Events',
      subtitle: 'Elevate your brand experience',
      desc: 'From high-stakes product launches and international conferences to exclusive executive retreats. We handle the logistics so you can focus on the business.',
      features: [
        'Venue Sourcing & Negotiation',
        'Complete AV & Stage Production',
        'Guest Registration Management',
        'Branded Gifting & Swag',
        'Keynote Speaker Coordination'
      ],
      img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'
    },
    {
      title: 'Luxury Weddings',
      subtitle: 'Your perfect day, flawlessly executed',
      desc: 'Bespoke wedding planning ensuring every detail reflects your personal love story. We specialize in both domestic and destination weddings that leave guests breathless.',
      features: [
        'Full-Service Planning & Design',
        'Budget Management',
        'Menu & Mixology Curation',
        'Rehearsal Dinner Coordination',
        'Honeymoon Planning Assistance'
      ],
      img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80'
    },
    {
      title: 'Private Celebrations',
      subtitle: 'Milestones meant to be remembered',
      desc: 'From 50th birthday extravaganzas and golden anniversaries to exclusive launch parties, we curate private events that leave lasting impressions. We specialize in transforming ordinary spaces into extraordinary environments, bringing in top-tier entertainment and catering to create an atmosphere of pure celebration.',
      features: [
        'Thematic Concept Development',
        'Surprise & Delight Elements',
        'World-Class Entertainment Sourcing',
        'Custom Installation & Florals',
        'Discreet VIP Security',
        'Photography & Videography'
      ],
      img: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&q=80'
    }
  ];

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
        <div className="space-y-32">
          {services.map((service, idx) => (
            <div key={idx} className={`flex flex-col lg:flex-row gap-16 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="w-full lg:w-1/2 relative group">
                 <div className={`absolute inset-0 bg-amber-500 rounded-2xl transform ${idx % 2 === 0 ? 'translate-x-4' : '-translate-x-4'} translate-y-4 opacity-20 transition-transform group-hover:translate-x-6 group-hover:translate-y-6`}></div>
                <img 
                  src={service.img} 
                  alt={service.title} 
                  className="rounded-2xl shadow-2xl w-full h-[500px] object-cover relative z-10"
                />
              </div>
              <div className="w-full lg:w-1/2">
                <span className="text-amber-600 font-bold tracking-widest uppercase text-sm mb-3 block">{service.subtitle}</span>
                <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">{service.title}</h2>
                <div className="w-20 h-1 bg-amber-500 mb-8"></div>
                <p className="text-gray-600 text-lg leading-relaxed mb-10">{service.desc}</p>
                
                <h4 className="text-xl font-bold text-gray-900 mb-6 font-serif">What's Included:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-10">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start text-gray-700">
                      <Check className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full shadow-lg text-white bg-gray-900 hover:bg-gray-800 transition-colors">
                  Inquire Now
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
