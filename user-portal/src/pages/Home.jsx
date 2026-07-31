import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, PartyPopper, CheckCircle2, ChevronRight, Award, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col min-h-screen font-sans text-gray-800"
    >
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80"
            alt="Luxurious Event Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start w-full">
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6 max-w-4xl">
            Designing <span className="text-amber-500 italic">Extraordinary</span> Moments That Last a Lifetime
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
            From intimate gatherings to grand corporate galas, we orchestrate seamless, bespoke events tailored specifically to your unique vision and style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/contact" className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-medium transition-colors flex items-center justify-center text-lg shadow-lg shadow-amber-600/30">
              Start Planning <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/services" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-medium transition-all text-center text-lg">
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-amber-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-amber-500/50">
            <div>
              <p className="text-4xl font-bold font-serif mb-2">500+</p>
              <p className="text-amber-100 font-medium">Events Executed</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-serif mb-2">98%</p>
              <p className="text-amber-100 font-medium">Client Retention</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-serif mb-2">15+</p>
              <p className="text-amber-100 font-medium">Years Experience</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-serif mb-2">50+</p>
              <p className="text-amber-100 font-medium">Industry Awards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Our Areas of Expertise</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We specialize in creating immersive experiences across a diverse range of event types. Every detail is meticulously planned and flawlessly executed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80" alt="Corporate Event" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 relative">
                <div className="absolute -top-10 right-8 w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg text-white">
                  <PartyPopper className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-gray-900 mb-4">Corporate Events</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Conferences, product launches, galas, and team building experiences designed to elevate your brand and impress stakeholders.
                </p>
                <Link to="/services" className="inline-flex items-center text-amber-600 font-medium hover:text-amber-700">
                  Learn more <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80" alt="Wedding" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 relative">
                <div className="absolute -top-10 right-8 w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg text-white">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-gray-900 mb-4">Luxury Weddings</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Bespoke wedding planning ensuring every detail reflects your personal love story. From destination weddings to intimate ceremonies.
                </p>
                <Link to="/services" className="inline-flex items-center text-amber-600 font-medium hover:text-amber-700">
                  Learn more <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&q=80" alt="Private Party" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 relative">
                <div className="absolute -top-10 right-8 w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg text-white">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-gray-900 mb-4">Private Celebrations</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Milestone birthdays, exclusive dinners, and private parties curated with precision for an unforgettable VIP experience.
                </p>
                <Link to="/services" className="inline-flex items-center text-amber-600 font-medium hover:text-amber-700">
                  Learn more <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">Why Partner With Us?</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We believe that the best events are the ones where you get to be a guest. We handle the stress, the logistics, and the countless details so you can focus on making memories.
              </p>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-amber-500 mr-4 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Unmatched Attention to Detail</h4>
                    <p className="text-gray-600">From the napkins to the lighting, we scrutinize every element to ensure absolute perfection.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-amber-500 mr-4 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Exclusive Vendor Network</h4>
                    <p className="text-gray-600">Gain access to our closely-guarded list of premium caterers, florists, and entertainers.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-amber-500 mr-4 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Transparent Communication</h4>
                    <p className="text-gray-600">Stay informed with regular updates, clear budgets, and a dedicated planning timeline.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 rounded-3xl translate-x-4 translate-y-4"></div>
              <img
                src="https://images.unsplash.com/photo-1522158637959-30385a09e0da?auto=format&fit=crop&q=80"
                alt="Event Planning Team"
                className="relative rounded-3xl z-10 w-full h-[500px] object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 mix-blend-multiply"></div>
          <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Crowd celebrating" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Let's Bring Your Vision to Life</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Schedule a complimentary consultation with our senior event directors and discover how we can elevate your next occasion.
          </p>
          <Link to="/contact" className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-lg font-bold rounded-full shadow-2xl text-gray-900 bg-amber-500 hover:bg-amber-400 transition-colors">
            Book Your Consultation
          </Link>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
