import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Leads from './pages/admin/Leads';
import Quotes from './pages/admin/Quotes';
import Projects from './pages/admin/Projects';
import ProjectGlobalInbox from './pages/admin/ProjectGlobalInbox';
import OutdoorKitchenProjects from './pages/admin/OutdoorKitchenProjects';
import GardenRoomProjects from './pages/admin/GardenRoomProjects';
import FieldMapping from './pages/admin/FieldMapping';
import Partners from './pages/admin/Partners';
import Finance from './pages/admin/Finance';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import Planning from './pages/admin/Planning';
import Tasks from './pages/admin/Tasks';
import Invoices from './pages/admin/Invoices';
import Bank from './pages/admin/Bank';
import Taxes from './pages/admin/Taxes';
import ProfitLoss from './pages/admin/ProfitLoss';
import Customers from './pages/admin/Customers';
import AdminPhotos from './pages/admin/AdminPhotos';

// Partner Pages
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerProjects from './pages/partner/PartnerProjects';
import PartnerPlanning from './pages/partner/PartnerPlanning';
import PartnerPriceRequests from './pages/partner/PartnerPriceRequests';
import Documents from './pages/Documents';
import Profile from './pages/Profile';

// Customer Pages
import CustomerProject from './pages/customer/CustomerProject';
import CustomerDocuments from './pages/customer/CustomerDocuments';
import CustomerPhotos from './pages/customer/CustomerPhotos';
import CustomerContact from './pages/customer/CustomerContact';
import CustomerQuotes from './pages/customer/CustomerQuotes';
import PublicOfferte from './pages/PublicOfferte';

// Protected Route
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return children;
}

// Placeholder Page
const PlaceholderPage = ({ title, subtitle }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-heading font-bold text-primary">{title}</h2>
      {subtitle && <p className="text-dark/50 text-sm font-body mt-1">{subtitle}</p>}
    </div>
    <div className="border-2 border-dashed border-secondary/50 rounded-2xl p-16 text-center">
      <p className="text-dark/30 font-body text-sm">{title} content will be displayed here.</p>
    </div>
  </div>
);

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />
      <Route path="/offerte/:token" element={<PublicOfferte />} />
      <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/login" replace />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><MainLayout role="admin" /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="quotes" element={<Quotes />} />
        <Route path="projects" element={<Navigate to="/admin/projects/inbox" replace />} />
        <Route path="projects/all" element={<Navigate to="/admin/projects/inbox" replace />} />
        <Route path="projects/inbox" element={<ProjectGlobalInbox />} />
        <Route path="projects/outdoor-kitchens" element={<OutdoorKitchenProjects />} />
        <Route path="projects/outdoor-kitchen" element={<OutdoorKitchenProjects />} />
        <Route path="projects/garden-rooms" element={<GardenRoomProjects />} />
        <Route path="projects/garden-room" element={<GardenRoomProjects />} />
        <Route path="projects/field-mapping" element={<FieldMapping />} />
        <Route path="partners" element={<Partners />} />
        <Route path="documents" element={<Documents role="admin" />} />
        <Route path="finance" element={<Finance />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="customers" element={<Customers />} />
        <Route path="bank" element={<Bank />} />
        <Route path="taxes" element={<Taxes />} />
        <Route path="profit-loss" element={<ProfitLoss />} />
        <Route path="planning" element={<Planning />} />
        <Route path="photos" element={<AdminPhotos />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Partner */}
      <Route path="/partner" element={<ProtectedRoute requiredRole="partner"><MainLayout role="partner" /></ProtectedRoute>}>
        <Route path="dashboard" element={<PartnerDashboard />} />
        <Route path="projects" element={<PartnerProjects />} />
        <Route path="price-requests" element={<PartnerPriceRequests />} />
        <Route path="planning" element={<PartnerPlanning />} />
        <Route path="documents" element={<Documents role="partner" />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Customer */}
      <Route path="/customer" element={<ProtectedRoute requiredRole="customer"><MainLayout role="customer" /></ProtectedRoute>}>
        <Route path="dashboard" element={<Navigate to="/customer/project" replace />} />
        <Route path="project" element={<CustomerProject />} />
        <Route path="quotes" element={<CustomerQuotes />} />
        <Route path="documents" element={<CustomerDocuments />} />
        <Route path="photos" element={<CustomerPhotos />} />
        <Route path="contact" element={<CustomerContact />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
