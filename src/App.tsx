import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import PlanogramsPage from './pages/PlanogramsPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import FieldTeamsPage from './pages/FieldTeamsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PlanogramPrototype from './pages/PlanogramPrototype';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="planograms" element={<PlanogramsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="field-teams" element={<FieldTeamsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
          
          {/* Planogram Designer (full screen) */}
          <Route path="/planograms/designer" element={<PlanogramPrototype />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
