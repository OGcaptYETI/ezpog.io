import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SuperAdminRoute } from './components/SuperAdminRoute';
import { AppLayout } from './components/layout/AppLayout';
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import PlanogramsPage from './pages/PlanogramsPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import FieldTeamsPage from './pages/FieldTeamsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PlanogramPrototype from './pages/PlanogramPrototype';
import SuperAdminOrganizationsPage from './pages/superadmin/OrganizationsPage';
import SuperAdminUsersPage from './pages/superadmin/UsersPage';
import SuperAdminAnalyticsPage from './pages/superadmin/AnalyticsPage';
import SuperAdminSettingsPage from './pages/superadmin/SettingsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected App Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="planograms" element={<PlanogramsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="field-teams" element={<FieldTeamsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
          
          {/* Planogram Designer (full screen, protected) */}
          <Route
            path="/planograms/designer"
            element={
              <ProtectedRoute>
                <PlanogramPrototype />
              </ProtectedRoute>
            }
          />
          
          {/* Super Admin Routes */}
          <Route
            path="/super-admin"
            element={
              <SuperAdminRoute>
                <SuperAdminLayout />
              </SuperAdminRoute>
            }
          >
            <Route path="organizations" element={<SuperAdminOrganizationsPage />} />
            <Route path="users" element={<SuperAdminUsersPage />} />
            <Route path="analytics" element={<SuperAdminAnalyticsPage />} />
            <Route path="settings" element={<SuperAdminSettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
