import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { type Store } from '@/services/firestore/stores';
import { Building2, ArrowLeft, MapPin, Phone, Mail, User, Edit, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  // RBAC
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    loadStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const loadStore = async () => {
    if (!storeId) {
      navigate('/dashboard/stores');
      return;
    }

    try {
      setLoading(true);
      const storeDoc = await getDoc(doc(db, 'stores', storeId));
      
      if (!storeDoc.exists()) {
        showToast('Store not found', 'error');
        navigate('/dashboard/stores');
        return;
      }

      setStore({ id: storeDoc.id, ...storeDoc.data() } as Store);
    } catch (error) {
      console.error('Error loading store:', error);
      showToast('Failed to load store details', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading store details...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Store not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/stores')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store.storeName}</h1>
              <p className="text-gray-600 mt-1">
                {store.storeNumber && <span className="font-mono">#{store.storeNumber} • </span>}
                <span className="font-mono">{store.storeId}</span>
              </p>
            </div>
          </div>

          {canEdit && (
            <Button
              onClick={() => showToast('Edit functionality coming soon!', 'info')}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Store
            </Button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          store.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {store.isActive ? (
            <><CheckCircle className="w-4 h-4" /> Active</>
          ) : (
            <><XCircle className="w-4 h-4" /> Inactive</>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Image */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Store Image</h2>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No image uploaded</p>
                {canEdit && (
                  <Button
                    onClick={() => showToast('Image upload coming soon!', 'info')}
                    variant="outline"
                    className="mt-4"
                  >
                    Upload Image
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Location
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">{store.address}</p>
                <p className="text-gray-900">{store.city}, {store.state} {store.zipCode}</p>
                <p className="text-gray-600">{store.country || 'USA'}</p>
              </div>
              
              {(store.latitude || store.longitude) && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Coordinates</p>
                  <p className="text-gray-900 font-mono text-sm">
                    {store.latitude}, {store.longitude}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <p className="text-sm font-medium text-gray-500">Region</p>
                  <p className="text-gray-900">{store.region || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">District</p>
                  <p className="text-gray-900">{store.district || '—'}</p>
                </div>
                {store.marketArea && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Market Area</p>
                    <p className="text-gray-900">{store.marketArea}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {store.customFields && Object.keys(store.customFields).length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Custom Fields</h2>
              <dl className="grid grid-cols-2 gap-4">
                {Object.entries(store.customFields).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-3">
                    <dt className="text-sm font-medium text-gray-500">{key}</dt>
                    <dd className="text-gray-900 mt-1">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Store Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Store Details</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Store Format</dt>
                <dd className="mt-1">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-700">
                    {store.storeFormat}
                  </span>
                </dd>
              </div>
              
              {store.squareFootage && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Square Footage</dt>
                  <dd className="text-gray-900 mt-1">{store.squareFootage.toLocaleString()} sq ft</dd>
                </div>
              )}
              
              {store.fixtureCount && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fixture Count</dt>
                  <dd className="text-gray-900 mt-1">{store.fixtureCount}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact</h2>
            <dl className="space-y-4">
              {store.storeManagerName && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Store Manager
                  </dt>
                  <dd className="text-gray-900 mt-1">{store.storeManagerName}</dd>
                </div>
              )}
              
              {store.storeManagerEmail && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${store.storeManagerEmail}`}
                      className="text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      {store.storeManagerEmail}
                    </a>
                  </dd>
                </div>
              )}
              
              {store.storePhone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${store.storePhone}`}
                      className="text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      {store.storePhone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Metadata
            </h2>
            <dl className="space-y-3 text-sm">
              {store.createdByName && (
                <div>
                  <dt className="text-gray-500">Created By</dt>
                  <dd className="text-gray-900 mt-1">{store.createdByName}</dd>
                </div>
              )}
              {store.createdAt && (
                <div>
                  <dt className="text-gray-500">Created At</dt>
                  <dd className="text-gray-900 mt-1">
                    {store.createdAt.toDate().toLocaleDateString()}
                  </dd>
                </div>
              )}
              {store.updatedAt && (
                <div>
                  <dt className="text-gray-500">Last Updated</dt>
                  <dd className="text-gray-900 mt-1">
                    {store.updatedAt.toDate().toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Assigned Projects</h2>
            <p className="text-sm text-gray-500">No projects assigned yet</p>
            {canEdit && (
              <Button
                onClick={() => showToast('Project assignment coming soon!', 'info')}
                variant="outline"
                className="w-full mt-4"
              >
                Assign to Project
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
