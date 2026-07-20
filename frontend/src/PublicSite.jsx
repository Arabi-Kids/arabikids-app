import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ActiveChildProvider } from './context/ActiveChildContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AddToHomeScreen from './components/AddToHomeScreen.jsx';
import SessionPacingReminder from './components/SessionPacingReminder.jsx';

import Home from './pages/Home.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Pricing from './pages/Pricing.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ThankYou from './pages/ThankYou.jsx';
import AddChild from './pages/AddChild.jsx';
import LessonHub from './pages/LessonHub.jsx';
import StageLessons from './pages/StageLessons.jsx';
import Lesson from './pages/Lesson.jsx';
import StageCheckpoint from './pages/StageCheckpoint.jsx';
import StageVideo from './pages/StageVideo.jsx';
import Progress from './pages/Progress.jsx';
import Account from './pages/Account.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import NotFound from './pages/NotFound.jsx';

export default function PublicSite() {
  return (
    <AuthProvider>
      <ActiveChildProvider>
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/thank-you"
                element={
                  <ProtectedRoute>
                    <ThankYou />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-child"
                element={
                  <ProtectedRoute>
                    <AddChild />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lessons"
                element={
                  <ProtectedRoute>
                    <LessonHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lessons/stage/:stageId"
                element={
                  <ProtectedRoute>
                    <StageLessons />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lessons/stage/:stageId/lesson/:orderIndex"
                element={
                  <ProtectedRoute>
                    <Lesson />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lessons/stage/:stageId/checkpoint/:checkpointOrder"
                element={
                  <ProtectedRoute>
                    <StageCheckpoint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lessons/stage/:stageId/video"
                element={
                  <ProtectedRoute>
                    <StageVideo />
                  </ProtectedRoute>
                }
              />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <AddToHomeScreen />
          <SessionPacingReminder />
        </div>
      </ActiveChildProvider>
    </AuthProvider>
  );
}
