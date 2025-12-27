import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BloodBankLayout from "./layouts/BloodBankLayout";
import DashboardOverview from "./pages/bloodbank/DashboardOverview";
import HospitalRequests from "./pages/bloodbank/HospitalRequests";
import NgoDrives from "./pages/bloodbank/NgoDrives";
import BloodStock from "./pages/bloodbank/BloodStock";
import AdminMessages from "./pages/bloodbank/AdminMessages";
import ProfileSettings from "./pages/bloodbank/ProfileSettings";
import HospitalLayout from "./layouts/HospitalLayout";
import HospitalOverview from "./pages/hospital/Overview";
import HospitalBloodRequests from "./pages/hospital/BloodRequests";
import HospitalNgoDrives from "./pages/hospital/NgoDrives";
import HospitalAdminVerification from "./pages/hospital/AdminVerification";
import HospitalProfile from "./pages/hospital/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Blood Bank Dashboard with Nested Routes */}
      <Route path="/bloodbank" element={<BloodBankLayout />}>
        <Route index element={<Navigate to="/bloodbank/overview" replace />} />
        <Route path="overview" element={<DashboardOverview />} />
        <Route path="hospital-requests" element={<HospitalRequests />} />
        <Route path="ngo-drives" element={<NgoDrives />} />
        <Route path="blood-stock" element={<BloodStock />} />
        <Route path="admin-messages" element={<AdminMessages />} />
        <Route path="profile-settings" element={<ProfileSettings />} />
      </Route>

      {/* Hospital Dashboard (manual access) */}
      <Route path="/hospital" element={<HospitalLayout />}>
        <Route index element={<Navigate to="/hospital/overview" replace />} />
        <Route path="overview" element={<HospitalOverview />} />
        <Route path="blood-requests" element={<HospitalBloodRequests />} />
        <Route path="ngo-drives" element={<HospitalNgoDrives />} />
        <Route path="admin" element={<HospitalAdminVerification />} />
        <Route path="profile" element={<HospitalProfile />} />
      </Route>
    </Routes>
  );
}
