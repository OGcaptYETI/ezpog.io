import { useNavigate } from 'react-router-dom';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { AlertCircle, X, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function ImpersonationBanner() {
  const { impersonatedUser, isImpersonating, stopImpersonation } = useImpersonation();
  const navigate = useNavigate();

  if (!isImpersonating || !impersonatedUser) return null;

  const handleExit = () => {
    stopImpersonation();
    navigate('/super-admin/users');
  };

  return (
    <div className="bg-amber-500 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 animate-pulse" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="font-semibold">Super Admin Mode:</span>
            <span>
              Viewing as <strong>{impersonatedUser.displayName || impersonatedUser.email}</strong>
            </span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
              {impersonatedUser.role} • {impersonatedUser.systemRole}
            </span>
          </div>
        </div>
        
        <Button
          onClick={handleExit}
          variant="outline"
          size="sm"
          className="bg-white text-amber-600 hover:bg-amber-50 border-0"
        >
          <X className="w-4 h-4 mr-1" />
          Exit Impersonation
        </Button>
      </div>
    </div>
  );
}
