import { User } from 'lucide-react';
import { useAuth } from '@/features/auth';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="font-bold text-2xl text-primary">
          EZPOG<span className="text-blue-600">.io</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">{user.displayName || user.email}</span>
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
        )}
      </div>
    </header>
  );
}
