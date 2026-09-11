import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Contact from './pages/Contact';
import BookNow from './pages/BookNow';
import Track from './pages/Track';
import TrackSearch from './pages/TrackSearch';

// New Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import MyRequests from './pages/MyRequests';
import RequestDetail from './pages/RequestDetail';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthProvider>
        <Router>
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/book" element={<BookNow />} />
              
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Legacy Track Routes */}
              <Route path="/track" element={<TrackSearch />} />
              <Route path="/track/:leadId" element={<Track />} />

              {/* Protected Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
              <Route path="/requests/:id" element={<ProtectedRoute><RequestDetail /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </AuthProvider>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
