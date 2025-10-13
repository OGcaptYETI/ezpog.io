import { User, LogOut, Settings, Building2 } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { signOut } from '@/services/firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img 
          src="/Header_Left_100x300.png" 
          alt="EZPOG.io" 
          className="h-8"
        />
      </div>

      {/* User Profile */}
      <div className="relative">
        {user ? (
          <>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
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
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {/* Admin-only Organization Settings */}
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          navigate('/dashboard/org-settings');
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                      >
                        <Building2 className="w-4 h-4" />
                        Organization Settings
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        navigate('/dashboard/settings');
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4" />
                      My Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 border-t"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
        )}
      </div>
    </header>
  );
}
