import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useDataSync } from './hooks/useDataSync';
import { reloadProductConfigFromBackend } from './utils/productConfigManager';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Leads from './pages/admin/Leads';
import Quotes from './pages/admin/Quotes';
import Projects from './pages/admin/Projects';
import ProjectGlobalInbox from './pages/admin/ProjectGlobalInbox';
import ProjectChatInboxPage from './pages/admin/ProjectChatInboxPage';
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
import PdfPreview from './pages/PdfPreview';

// Protected Route
function ProtectedRoute({ children, requiredRole }) {
  const { user, isLoading } = useAuth();

  // If initial auth verification is running and we don't have a cached user yet, show a clean loading spinner
  if (!user && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#2C3E35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#2C3E35]/60 font-medium">Laden...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> go to login, preserving the route they were trying to visit
  if (!user) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }

  // Allow Admin to view any portal in preview/impersonation mode
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
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
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const redirectTarget = searchParams.get('redirect');

  // Multi-user real-time synchronization between Tim & Bram
  useDataSync({ enabled: Boolean(user) });

  useEffect(() => {
    if (user) {
      reloadProductConfigFromBackend();
    }
  }, [user]);

  useEffect(() => {
    // Round 2 & 3 Clean Slate: purge all legacy prototype mock caches so app starts at 0
    const resetKey = 'clean_slate_reset_v4_zero_slate';
    if (!localStorage.getItem(resetKey)) {
      const keysToClear = [
        'app_quotes_v2',
        'app_leads_v2',
        'app_projects_v2',
        'app_pipeline_candidates',
        'pipeline_candidates_migrated',
        'app_invoices_v2',
        'va_general_logbook',
        'va_custom_photos',
        'quote_editor_draft_new',
        'vanuit_active_quote_session',
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      // Clear all project-scoped logbooks
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('va_project_logbook_') || k.startsWith('active_quote_')) {
          localStorage.removeItem(k);
        }
      });
      localStorage.setItem(resetKey, 'true');
    }
  }, []);

  const defaultHome = user
    ? (redirectTarget && redirectTarget.startsWith('/') ? redirectTarget : `/${user.role}/dashboard`)
    : '/login';

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={redirectTarget && redirectTarget.startsWith('/') ? redirectTarget : `/${user.role}/dashboard`}
              replace
            />
          ) : (
            <Login />
          )
        }
      />
      <Route path="/pdf-preview" element={<PdfPreview />} />
      <Route path="/offerte/:token" element={<PublicOfferte />} />
      <Route path="/" element={<Navigate to={defaultHome} replace />} />

      {/* Admin — 7 Working Day Sections (Brief Navigation Restructure) */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><MainLayout role="admin" /></ProtectedRoute>}>
        {/* 1. Vandaag */}
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="vandaag" element={<Navigate to="/admin/dashboard" replace />} />

        {/* 2. Verkoop (Leads, Offertes, Klanten) */}
        <Route path="leads" element={<Leads />} />
        <Route path="quotes" element={<Quotes />} />
        <Route path="customers" element={<Customers />} />
        <Route path="verkoop/leads" element={<Navigate to="/admin/leads" replace />} />
        <Route path="verkoop/offertes" element={<Navigate to="/admin/quotes" replace />} />
        <Route path="verkoop/klanten" element={<Navigate to="/admin/customers" replace />} />

        {/* 3. Uitvoering (Projecten, Planning) */}
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<OutdoorKitchenProjects />} />
        <Route path="planning" element={<Planning />} />
        <Route path="uitvoering/projecten" element={<Navigate to="/admin/projects" replace />} />
        <Route path="uitvoering/planning" element={<Navigate to="/admin/planning" replace />} />

        {/* 4. Berichten (Inbox with unread counter) */}
        <Route path="inbox" element={<ProjectChatInboxPage />} />
        <Route path="berichten" element={<Navigate to="/admin/inbox" replace />} />
        <Route path="projects/inbox" element={<Navigate to="/admin/inbox" replace />} />
        <Route path="projects/inbox-messages" element={<Navigate to="/admin/inbox" replace />} />
        <Route path="projects/inbox-create" element={<Navigate to="/admin/inbox" replace />} />

        {/* 5. Partners */}
        <Route path="partners" element={<Partners />} />

        {/* 6. Financiën (Facturen, Bank, Btw, Winst & Verlies) */}
        <Route path="finance" element={<Finance />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="bank" element={<Bank />} />
        <Route path="taxes" element={<Taxes />} />
        <Route path="profit-loss" element={<ProfitLoss />} />
        <Route path="financien/facturen" element={<Navigate to="/admin/invoices" replace />} />
        <Route path="financien/bank" element={<Navigate to="/admin/bank" replace />} />
        <Route path="financien/btw" element={<Navigate to="/admin/taxes" replace />} />
        <Route path="financien/winst-verlies" element={<Navigate to="/admin/profit-loss" replace />} />

        {/* 7. Instellingen */}
        <Route path="settings" element={<Settings />} />
        <Route path="instellingen" element={<Navigate to="/admin/settings" replace />} />

        {/* Legacy Mockup & Prototype Redirects */}
        <Route path="projects/all" element={<Navigate to="/admin/projects" replace />} />
        <Route path="projects/outdoor-kitchens" element={<Navigate to="/admin/projects" replace />} />
        <Route path="projects/outdoor-kitchen" element={<Navigate to="/admin/projects" replace />} />
        <Route path="projects/garden-rooms" element={<Navigate to="/admin/projects" replace />} />
        <Route path="projects/garden-room" element={<Navigate to="/admin/projects" replace />} />
        <Route path="projects/field-mapping" element={<Navigate to="/admin/settings" replace />} />
        <Route path="documents" element={<Navigate to="/admin/projects?tab=documents" replace />} />
        <Route path="photos" element={<Navigate to="/admin/projects?tab=documents" replace />} />
        <Route path="tasks" element={<Navigate to="/admin/dashboard?view=tasks" replace />} />
        <Route path="reports" element={<Reports />} />
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
