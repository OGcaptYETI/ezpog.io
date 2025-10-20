import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { type Store } from '@/services/firestore/stores';
import { 
  Building2, ArrowLeft, MapPin, Phone, Mail, User, Edit, Calendar, 
  CheckCircle, XCircle, Camera, Briefcase, History, Package, Settings, 
  Image as ImageIcon, Info
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { EditStoreModal } from '@/components/stores/EditStoreModal';
import { ImageUploadModal } from '@/components/stores/ImageUploadModal';
import { ProjectAssignmentModal } from '@/components/stores/ProjectAssignmentModal';
import { ResetHistoryModal, type ResetRecord } from '@/components/stores/ResetHistoryModal';

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showProjectAssignment, setShowProjectAssignment] = useState(false);
  const [showResetHistory, setShowResetHistory] = useState(false);

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
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Store not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/stores')}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Stores</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store.storeName}</h1>
              <div className="flex items-center gap-3 mt-1">
                {store.storeNumber && (
                  <span className="text-gray-600 font-mono text-sm">#{store.storeNumber}</span>
                )}
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 font-mono text-sm">{store.storeId}</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                  store.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {store.isActive ? (
                    <><CheckCircle className="w-3 h-3" /> Active</>
                  ) : (
                    <><XCircle className="w-3 h-3" /> Inactive</>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {canEdit && (
              <>
                <Button
                  onClick={() => setShowEditModal(true)}
                  variant="outline"
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Store
                </Button>
                <Button
                  onClick={() => setShowProjectAssignment(true)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Assign to Project
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <Accordion>
        {/* Store Images & Media */}
        <AccordionItem 
          title="Store Images & Media" 
          icon={<Camera className="w-5 h-5" />}
          defaultOpen={true}
          badge={0}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center hover:border-indigo-400 transition-colors">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 mb-3">No images uploaded</p>
                {canEdit && (
                  <Button
                    onClick={() => setShowImageUpload(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Image Guidelines
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Recommended size: 1920x1080px</li>
                  <li>• Supported formats: JPG, PNG, WebP</li>
                  <li>• Max file size: 5MB</li>
                  <li>• Include store exterior and interior shots</li>
                </ul>
              </div>
            </div>
          </div>
        </AccordionItem>

        {/* Store Information */}
        <AccordionItem 
          title="Store Information" 
          icon={<Info className="w-5 h-5" />}
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Location Details
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-gray-900 mt-1">{store.address}</dd>
                  <dd className="text-gray-900">{store.city}, {store.state} {store.zipCode}</dd>
                  <dd className="text-gray-600">{store.country || 'USA'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Region</dt>
                    <dd className="text-gray-900 mt-1">{store.region || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">District</dt>
                    <dd className="text-gray-900 mt-1">{store.district || '—'}</dd>
                  </div>
                </div>
                {store.marketArea && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Market Area</dt>
                    <dd className="text-gray-900 mt-1">{store.marketArea}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Store Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Store Details
              </h3>
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
          </div>
        </AccordionItem>

        {/* Contact Information */}
        <AccordionItem 
          title="Contact Information" 
          icon={<User className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {store.storeManagerName && (
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-2">Store Manager</dt>
                <dd className="text-gray-900 font-medium">{store.storeManagerName}</dd>
              </div>
            )}
            {store.storeManagerEmail && (
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-2">Email</dt>
                <dd>
                  <a
                    href={`mailto:${store.storeManagerEmail}`}
                    className="text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {store.storeManagerEmail}
                  </a>
                </dd>
              </div>
            )}
            {store.storePhone && (
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-2">Phone</dt>
                <dd>
                  <a
                    href={`tel:${store.storePhone}`}
                    className="text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {store.storePhone}
                  </a>
                </dd>
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Assigned Projects */}
        <AccordionItem 
          title="Assigned Projects" 
          icon={<Briefcase className="w-5 h-5" />}
          badge={0}
        >
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No projects assigned yet</p>
            {canEdit && (
              <Button
                onClick={() => setShowProjectAssignment(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Assign to Project
              </Button>
            )}
          </div>
        </AccordionItem>

        {/* Reset History */}
        <AccordionItem 
          title="Reset & Remodel History" 
          icon={<History className="w-5 h-5" />}
          badge={(store as any).resetHistory?.length || 0}
        >
          {(store as any).resetHistory && (store as any).resetHistory.length > 0 ? (
            <div className="space-y-4">
              {(store as any).resetHistory.map((reset: ResetRecord, index: number) => (
                <div key={reset.id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{reset.title}</h4>
                      <p className="text-sm text-gray-600">{reset.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-4 ${
                      reset.status === 'completed' ? 'bg-green-100 text-green-700' :
                      reset.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      reset.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      reset.status === 'delayed' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {reset.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Type:</span> {reset.type.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Scheduled:</span> {reset.scheduledDate?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </div>
                    {reset.startDate && (
                      <div>
                        <span className="font-medium">Started:</span> {reset.startDate.toDate().toLocaleDateString()}
                      </div>
                    )}
                    {reset.completedDate && (
                      <div>
                        <span className="font-medium">Completed:</span> {reset.completedDate.toDate().toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {reset.notes && (
                    <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 mt-2">
                      <span className="font-medium">Notes:</span> {reset.notes}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Before: {reset.beforePhotos?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>After: {reset.afterPhotos?.length || 0}</span>
                    </div>
                    <div className="ml-auto">
                      Created by {reset.createdByName}
                    </div>
                  </div>
                </div>
              ))}
              {canEdit && (
                <Button
                  onClick={() => setShowResetHistory(true)}
                  variant="outline"
                  className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <History className="w-4 h-4 mr-2" />
                  Add Another Reset Record
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No reset history yet</p>
              {canEdit && (
                <Button
                  onClick={() => setShowResetHistory(true)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <History className="w-4 h-4 mr-2" />
                  Add Reset Record
                </Button>
              )}
            </div>
          )}
        </AccordionItem>

        {/* Custom Fields */}
        {store.customFields && Object.keys(store.customFields).length > 0 && (
          <AccordionItem 
            title="Custom Fields" 
            icon={<Package className="w-5 h-5" />}
            badge={Object.keys(store.customFields).length}
          >
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(store.customFields).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 mb-1">{key}</dt>
                  <dd className="text-gray-900 font-medium">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </AccordionItem>
        )}

        {/* Metadata */}
        <AccordionItem 
          title="Metadata" 
          icon={<Calendar className="w-5 h-5" />}
        >
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {store.createdByName && (
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-1">Created By</dt>
                <dd className="text-gray-900 font-medium">{store.createdByName}</dd>
              </div>
            )}
            {store.createdAt && (
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-1">Created At</dt>
                <dd className="text-gray-900 font-medium">
                  {store.createdAt.toDate().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            )}
            {store.updatedAt && (
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-1">Last Updated</dt>
                <dd className="text-gray-900 font-medium">
                  {store.updatedAt.toDate().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            )}
          </dl>
        </AccordionItem>
      </Accordion>

      {/* Edit Store Modal */}
      {store && (
        <EditStoreModal
          store={store}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadStore}
        />
      )}

      {/* Image Upload Modal */}
      {store && (
        <ImageUploadModal
          storeId={store.id}
          storeName={store.storeName}
          isOpen={showImageUpload}
          onClose={() => setShowImageUpload(false)}
          onSuccess={loadStore}
        />
      )}

      {/* Project Assignment Modal */}
      {store && (
        <ProjectAssignmentModal
          store={store}
          isOpen={showProjectAssignment}
          onClose={() => setShowProjectAssignment(false)}
          onSuccess={loadStore}
        />
      )}

      {/* Reset History Modal */}
      {store && (
        <ResetHistoryModal
          storeId={store.id}
          storeName={store.storeName}
          isOpen={showResetHistory}
          onClose={() => setShowResetHistory(false)}
          onSuccess={loadStore}
        />
      )}
    </div>
  );
}
