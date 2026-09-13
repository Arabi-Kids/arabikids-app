import { Routes, Route, Navigate } from 'react-router-dom';
import { AffiliateAuthProvider } from './affiliate/AffiliateAuthContext.jsx';
import AffiliateProtectedRoute from './affiliate/AffiliateProtectedRoute.jsx';
import AffiliateLayout from './affiliate/AffiliateLayout.jsx';
import AffiliateLogin from './affiliate/AffiliateLogin.jsx';
import AffiliateRegister from './affiliate/AffiliateRegister.jsx';
import AffiliateDashboard from './affiliate/AffiliateDashboard.jsx';
import AffiliateReferrals from './affiliate/AffiliateReferrals.jsx';
import AffiliatePayouts from './affiliate/AffiliatePayouts.jsx';

// Third, fully separate product from the public site and admin portal: its
// own auth context, its own token storage, its own layout.
export default function AffiliateApp() {
  return (
    <AffiliateAuthProvider>
      <Routes>
        <Route path="login" element={<AffiliateLogin />} />
        <Route path="register" element={<AffiliateRegister />} />
        <Route
          element={
            <AffiliateProtectedRoute>
              <AffiliateLayout />
            </AffiliateProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AffiliateDashboard />} />
          <Route path="referrals" element={<AffiliateReferrals />} />
          <Route path="payouts" element={<AffiliatePayouts />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </AffiliateAuthProvider>
  );
}
