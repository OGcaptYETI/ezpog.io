import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ImpersonationBanner } from '../ImpersonationBanner';

export function AppLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ImpersonationBanner />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
