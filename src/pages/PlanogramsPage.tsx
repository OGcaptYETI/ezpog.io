import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { Grid3x3, Plus, Filter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { PlanogramData } from '@/services/firestore/planograms';

export default function PlanogramsPage() {
  const [planograms, setPlanograms] = useState<PlanogramData[]>([]);
  const [loading, setLoading] = useState(true);
  const organizationId = 'demo-org';

  useEffect(() => {
    loadPlanograms();
  }, []);

  async function loadPlanograms() {
    try {
      const q = query(
        collection(db, 'planograms'),
        where('organizationId', '==', organizationId),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const planogramsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        approvedAt: doc.data().approvedAt?.toDate() || null,
      })) as PlanogramData[];
      
      setPlanograms(planogramsData);
    } catch (error) {
      console.error('Error loading planograms:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planograms</h1>
          <p className="text-gray-600 mt-1">Design and manage retail planograms</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="default">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Link to="/planograms/designer">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Planogram
            </Button>
          </Link>
        </div>
      </div>

      {/* Planograms Grid */}
      {planograms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Grid3x3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No planograms yet</h3>
          <p className="text-gray-600 mb-6">Create your first planogram to get started</p>
          <Link to="/planograms/designer">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Planogram
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planograms.map((planogram) => (
            <Link
              key={planogram.id}
              to={`/planograms/designer?id=${planogram.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Thumbnail - placeholder for now */}
              <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <Grid3x3 className="w-16 h-16 text-gray-300" />
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {planogram.name}
                  </h3>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2
                    ${planogram.status === 'active' ? 'bg-green-100 text-green-700' :
                      planogram.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      planogram.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'}
                  `}>
                    {planogram.status}
                  </span>
                </div>
                
                {planogram.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {planogram.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Version {planogram.version}</span>
                  <span>Updated {planogram.updatedAt.toLocaleDateString()}</span>
                </div>
                
                {planogram.fixtures && planogram.fixtures.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    {planogram.fixtures.length} fixture{planogram.fixtures.length !== 1 ? 's' : ''}, {' '}
                    {planogram.products?.length || 0} product{planogram.products?.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
