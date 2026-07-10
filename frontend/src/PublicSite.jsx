import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Pricing from './pages/Pricing.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ThankYou from './pages/ThankYou.jsx';
import LessonHub from './pages/LessonHub.jsx';
import Lesson from './pages/Lesson.jsx';
import Progress from './pages/Progress.jsx';
import Account from './pages/Account.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';

export default function PublicSite() {
  return (
    <AuthProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/thank-you"
              element={
                <ProtectedRoute>
                  <ThankYou />
                </ProtectedRoute>
              }
            />
            <Route path="/lessons/:group" element={<LessonHub />} />
            <Route path="/lessons/:group/:id" element={<Lesson />} />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
