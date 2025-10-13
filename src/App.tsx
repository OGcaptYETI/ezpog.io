import { useState } from 'react';
import { AuthProvider } from './features/auth';
import { Button } from './shared/components/ui/button';
import PlanogramPrototype from './pages/PlanogramPrototype';
import './App.css';

function App() {
  const [showPrototype, setShowPrototype] = useState(false);

  if (showPrototype) {
    return (
      <AuthProvider>
        <PlanogramPrototype onBackToDashboard={() => setShowPrototype(false)} />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">EZPOG.io</h1>
            <p className="text-muted-foreground">
              Planogram Management Platform - v2.0.0
            </p>
          </header>

          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">🎉 Setup Complete!</h2>
              <div className="space-y-2 text-sm">
                <p>✅ Vite + React + TypeScript</p>
                <p>✅ TailwindCSS configured</p>
                <p>✅ Firebase connected</p>
                <p>✅ Authentication ready</p>
                <p>✅ Database schema designed</p>
                <p>✅ Security rules deployed</p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Firebase Status</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Project:</strong> ezpog-5c2b6</p>
                <p><strong>Auth:</strong> Email/Password + Google ✅</p>
                <p><strong>Database:</strong> Clean and ready ✅</p>
                <p><strong>Storage:</strong> Configured ✅</p>
                <p><strong>Indexes:</strong> Building (29 indexes) 🔄</p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-blue-200 bg-blue-50">
              <h3 className="text-xl font-semibold mb-4 text-blue-900">🎨 React Flow Prototype Ready!</h3>
              <p className="text-sm text-blue-800 mb-4">
                Test the planogram canvas with drag-and-drop fixtures and products.
              </p>
              <Button onClick={() => setShowPrototype(true)} variant="default" size="lg">
                Launch Planogram Designer →
              </Button>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>✅ Deploy security rules</li>
                <li>✅ Build React Flow prototype</li>
                <li>⏳ Test authentication flow</li>
                <li>⏳ Continue with Week 1 tasks</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setShowPrototype(true)} variant="default">
                View Prototype
              </Button>
              <Button variant="outline">View Docs</Button>
              <Button variant="ghost">Settings</Button>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
