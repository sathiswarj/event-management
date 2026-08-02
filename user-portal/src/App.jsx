import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Track from './pages/Track';
import TrackSearch from './pages/TrackSearch';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Router>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/track" element={<TrackSearch />} />
            <Route path="/track/:leadId" element={<Track />} />
          </Routes>
        </main>
        <Footer />
      </Router>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
