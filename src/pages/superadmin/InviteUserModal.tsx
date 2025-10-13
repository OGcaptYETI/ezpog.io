import { useState, useEffect } from 'react';
import { X, Copy, Check, Mail, Building2, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { createInvitation, getAllPendingInvitations } from '@/services/firestore/invitations';
import { getAllOrganizations } from '@/services/firestore/organizations';
import { useAuth } from '@/features/auth';
import type { Invitation } from '@/services/firestore/invitations';
import type { Organization } from '@/types';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedOrgId?: string;
}

export function InviteUserModal({ isOpen, onClose, onSuccess, preselectedOrgId }: InviteUserModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    organizationId: preselectedOrgId || '',
    role: 'user' as 'admin' | 'manager' | 'user' | 'field_team',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      setFormData(prev => ({ ...prev, organizationId: preselectedOrgId || '' }));
    }
  }, [isOpen, preselectedOrgId]);

  async function loadData() {
    try {
      const [orgsData, invitesData] = await Promise.all([
        getAllOrganizations(),
        getAllPendingInvitations()
      ]);
      setOrganizations(orgsData);
      setPendingInvitations(invitesData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!formData.email || !formData.organizationId) {
      setError('Email and organization are required');
      setLoading(false);
      return;
    }

    try {
      const org = organizations.find(o => o.id === formData.organizationId);
      if (!org) {
        setError('Organization not found');
        setLoading(false);
        return;
      }

      const { token } = await createInvitation({
        email: formData.email,
        organizationId: formData.organizationId,
        organizationName: org.name,
        role: formData.role,
        invitedBy: user?.uid || '',
      });

      const link = `${window.location.origin}/signup?invite=${token}`;
      setInvitationLink(link);
      setSuccess(true);
      
      // Reload pending invitations
      await loadData();
      
      onSuccess();
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError('Failed to create invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleReset = () => {
    setFormData({
      email: '',
      organizationId: preselectedOrgId || '',
      role: 'user',
    });
    setSuccess(false);
    setInvitationLink('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E26713] flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invite User</h2>
              <p className="text-sm text-gray-600">Send an invitation to join the platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {success && invitationLink && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-2">
                    Invitation created successfully!
                  </p>
                  <div className="bg-white border border-green-200 rounded p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-1">Invitation Link:</p>
                    <p className="text-sm text-gray-900 break-all font-mono">{invitationLink}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleReset}
                      size="sm"
                      variant="outline"
                    >
                      Send Another Invitation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E26713] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E26713] focus:border-transparent appearance-none"
                    required
                  >
                    <option value="">Select organization...</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.plan})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E26713] focus:border-transparent appearance-none"
                    required
                  >
                    <option value="admin">Admin - Full organization access</option>
                    <option value="manager">Manager - Team management</option>
                    <option value="user">User - Standard access</option>
                    <option value="field_team">Field Team - Mobile access</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#E26713] hover:bg-[#CC5329]"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Invitation'}
                </Button>
              </div>
            </form>
          )}

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pending Invitations ({pendingInvitations.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pendingInvitations.map(invite => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{invite.email}</p>
                      <p className="text-xs text-gray-600">
                        {invite.organizationName} • {invite.role} • 
                        Expires: {invite.expiresAt.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
