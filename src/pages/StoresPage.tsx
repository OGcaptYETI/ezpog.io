import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { getStoresByOrganization, bulkDeleteStores, deleteAllStoresForOrganization, type Store } from '@/services/firestore/stores';
import { getProjectsByOrganization } from '@/services/firestore/projects';
import { Building2, Plus, Search, Upload, MapPin, Filter, ArrowUp, ArrowDown, Trash2, AlertTriangle, ChevronRight, ChevronDown, Mail, FileText, Briefcase, Users } from 'lucide-react';
import type { Project } from '@/types';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { CSVImportModal } from '@/components/stores/CSVImportModal';
import { AssignToFieldTeamModal } from '@/components/stores/AssignToFieldTeamModal';
import { AssignToUserModal } from '@/components/stores/AssignToUserModal';
import { AssignToProjectModal } from '@/components/stores/AssignToProjectModal';

type SortField = 'storeName' | 'storeId' | 'city' | 'state' | 'region' | 'storeFormat';
type SortDirection = 'asc' | 'desc';

export default function StoresPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'storeName' | 'storeId' | 'storeNumber' | 'city' | 'state'>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('storeName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterRegion, setFilterRegion] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterProject, setFilterProject] = useState('');
  
  // Projects for filtering
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  
  // Bulk operations state
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAssignmentMenu, setShowAssignmentMenu] = useState(false);
  
  // Assignment modals state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showFieldTeamModal, setShowFieldTeamModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Expandable rows state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // RBAC permissions
  const canCreate = user?.role === 'admin' || user?.role === 'manager';
  const canSelect = user?.role === 'admin' || user?.role === 'manager'; // Admins and managers can select stores
  const canDelete = user?.role === 'admin'; // Only admins can delete stores (backend only, no UI)

  useEffect(() => {
    loadStores();
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  const loadStores = async () => {
    if (!user?.organizationId) return;

    try {
      const storesData = await getStoresByOrganization(user.organizationId);
      setStores(storesData);
    } catch (error) {
      console.error('Error loading stores:', error);
      showToast('Failed to load stores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!user?.organizationId) return;

    try {
      setLoadingProjects(true);
      const projectsData = await getProjectsByOrganization(user.organizationId);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Bulk operation handlers
  const handleToggleSelect = (storeId: string) => {
    setSelectedStores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storeId)) {
        newSet.delete(storeId);
      } else {
        newSet.add(storeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedStores.size === filteredStores.length) {
      setSelectedStores(new Set());
    } else {
      setSelectedStores(new Set(filteredStores.map(s => s.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedStores.size === 0) return;
    
    setDeleting(true);
    try {
      await bulkDeleteStores(Array.from(selectedStores));
      showToast(`Successfully deleted ${selectedStores.size} stores`, 'success');
      setSelectedStores(new Set());
      setShowDeleteSelectedModal(false);
      await loadStores();
    } catch (error) {
      console.error('Error deleting stores:', error);
      showToast('Failed to delete stores', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!user?.organizationId) return;
    
    setDeleting(true);
    try {
      const count = await deleteAllStoresForOrganization(user.organizationId);
      showToast(`Successfully deleted all ${count} stores`, 'success');
      setShowDeleteAllModal(false);
      setSelectedStores(new Set());
      await loadStores();
    } catch (error) {
      console.error('Error deleting all stores:', error);
      showToast('Failed to delete stores', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Toggle row expansion
  const handleToggleExpand = (storeId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storeId)) {
        newSet.delete(storeId);
      } else {
        newSet.add(storeId);
      }
      return newSet;
    });
  };

  // Get unique values for filter dropdowns
  const uniqueRegions = useMemo(() => 
    [...new Set(stores.map(s => s.region).filter(Boolean))].sort(),
    [stores]
  );
  
  const uniqueStates = useMemo(() => 
    [...new Set(stores.map(s => s.state).filter(Boolean))].sort(),
    [stores]
  );
  
  const uniqueFormats = useMemo(() => 
    [...new Set(stores.map(s => s.storeFormat).filter(Boolean))].sort(),
    [stores]
  );

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    const filtered = stores.filter(s => {
      // Search filter - field-specific or all fields
      let matchesSearch = false;
      
      if (!searchTerm) {
        matchesSearch = true; // No search term, show all
      } else if (searchField === 'all') {
        // Search across all fields
        matchesSearch = s.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       s.storeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (s.storeNumber && s.storeNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                       s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       s.state.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        // Search in specific field only
        const fieldValue = s[searchField];
        if (fieldValue) {
          matchesSearch = fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
        }
      }
      
      if (!matchesSearch) return false;
      
      // Region filter
      if (filterRegion && s.region !== filterRegion) return false;
      
      // State filter
      if (filterState && s.state !== filterState) return false;
      
      // Format filter
      if (filterFormat && s.storeFormat !== filterFormat) return false;
      
      // Active status filter
      if (filterActive === 'active' && !s.isActive) return false;
      if (filterActive === 'inactive' && s.isActive) return false;
      
      // Project filter - check if store is in selected project's assignedStores
      if (filterProject) {
        const selectedProject = projects.find(p => p.id === filterProject);
        if (selectedProject && selectedProject.assignedStores) {
          if (!selectedProject.assignedStores.includes(s.id)) {
            return false;
          }
        } else {
          return false; // Project not found or has no stores
        }
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [stores, searchTerm, searchField, filterProject, filterRegion, filterState, filterFormat, filterActive, sortField, sortDirection, projects]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading stores...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-600" />
              Stores
            </h1>
            <p className="text-gray-600 mt-1">Manage your organization's store locations</p>
          </div>
          {canCreate && (
            <div className="flex gap-3">
              {user?.role === 'admin' && (
                <Button onClick={() => setIsImportModalOpen(true)} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              )}
              <Button onClick={() => showToast('Store creation modal coming in Phase 2B!', 'info')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Store
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Toolbar - Managers and Admins */}
      {canSelect && selectedStores.size > 0 && (
        <div className="mb-6 bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-indigo-900">
                {selectedStores.size} store{selectedStores.size !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => setSelectedStores(new Set())}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Clear selection
              </button>
            </div>
            
            {/* Assignment Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setShowAssignmentMenu(!showAssignmentMenu)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Assign to...
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {showAssignmentMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowAssignmentMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProjectModal(true);
                          setShowAssignmentMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3"
                      >
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        <div>
                          <div className="font-medium">Assign to Project</div>
                          <div className="text-xs text-gray-500">Link stores to a project</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setShowFieldTeamModal(true);
                          setShowAssignmentMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3 border-t"
                      >
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium">Assign to Field Team</div>
                          <div className="text-xs text-gray-500">Assign to a team cluster</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserModal(true);
                          setShowAssignmentMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3 border-t"
                      >
                        <Users className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium">Assign to User</div>
                          <div className="text-xs text-gray-500">Add to user's territory</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          {/* Search Field Selector */}
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as typeof searchField)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm font-medium"
          >
            <option value="all">All Fields</option>
            <option value="storeId">Store ID Only</option>
            <option value="storeName">Store Name Only</option>
            <option value="storeNumber">Store Number Only</option>
            <option value="city">City Only</option>
            <option value="state">State Only</option>
          </select>

          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={
                searchField === 'all' 
                  ? "Search stores by name, ID, number, city, or state..." 
                  : `Search by ${searchField === 'storeId' ? 'Store ID' : searchField === 'storeName' ? 'Store Name' : searchField === 'storeNumber' ? 'Store Number' : searchField === 'city' ? 'City' : 'State'}...`
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filterProject || filterRegion || filterState || filterFormat || filterActive !== 'all') && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {[filterProject, filterRegion, filterState, filterFormat, filterActive !== 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Project
                </label>
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  disabled={loadingProjects}
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.assignedStores?.length || 0} stores)
                    </option>
                  ))}
                </select>
              </div>
            
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Regions</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Formats</option>
                  {uniqueFormats.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(filterProject || filterRegion || filterState || filterFormat || filterActive !== 'all') && (
              <button
                onClick={() => {
                  setFilterProject('');
                  setFilterRegion('');
                  setFilterState('');
                  setFilterFormat('');
                  setFilterActive('all');
                }}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Stores</span>
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stores.length}</div>
          {filteredStores.length !== stores.length && (
            <p className="text-xs text-gray-500 mt-1">Showing {filteredStores.length}</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Active</span>
            <Building2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stores.filter(s => s.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Regions</span>
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {new Set(stores.map(s => s.region).filter(Boolean)).size}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Districts</span>
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {new Set(stores.map(s => s.district).filter(Boolean)).size}
          </div>
        </div>
      </div>

      {/* Stores List */}
      {filteredStores.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {stores.length === 0 ? 'No stores yet' : 'No matching stores'}
          </h3>
          <p className="text-gray-600 mb-6">
            {stores.length === 0
              ? 'Import stores from CSV or add them manually'
              : 'Try adjusting your search'}
          </p>
          {canCreate && stores.length === 0 && (
            <Button onClick={() => setIsImportModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Stores
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-xs">
                {/* Select All Checkbox - Managers and Admins */}
                {canSelect && (
                  <th className="px-3 py-2 w-10">
                    <input
                      type="checkbox"
                      checked={filteredStores.length > 0 && selectedStores.size === filteredStores.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </th>
                )}

                {/* Expand Column */}
                <th className="px-2 py-2 w-10"></th>

                {/* Store Name - Sortable */}
                <th 
                  onClick={() => handleSort('storeName')}
                  className="px-3 py-2 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    Store Name
                    {sortField === 'storeName' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </div>
                </th>

                {/* City - Sortable */}
                <th 
                  onClick={() => handleSort('city')}
                  className="px-3 py-2 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    City
                    {sortField === 'city' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </div>
                </th>

                {/* State - Sortable */}
                <th 
                  onClick={() => handleSort('state')}
                  className="px-3 py-2 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    State
                    {sortField === 'state' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </div>
                </th>

                {/* Region - Sortable */}
                <th 
                  onClick={() => handleSort('region')}
                  className="px-3 py-2 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    Region
                    {sortField === 'region' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </div>
                </th>

                {/* Phone */}
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Phone
                </th>

                {/* Actions */}
                <th className="px-3 py-2 text-center font-medium text-gray-600 w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStores.map((store) => {
                const isExpanded = expandedRows.has(store.id);
                return (
                  <React.Fragment key={store.id}>
                    {/* Main Compact Row */}
                    <tr className="hover:bg-gray-50 text-sm">
                      {/* Checkbox - Managers and Admins */}
                      {canSelect && (
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedStores.has(store.id)}
                            onChange={() => handleToggleSelect(store.id)}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                        </td>
                      )}

                      {/* Expand Arrow */}
                      <td className="px-2 py-2">
                        <button
                          onClick={() => handleToggleExpand(store.id)}
                          className="text-gray-400 hover:text-gray-600 transition-transform"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Store Name - Clickable */}
                      <td className="px-3 py-2">
                        <button
                          onClick={() => navigate(`/dashboard/stores/${store.id}`)}
                          className="text-left hover:text-indigo-600 font-medium transition-colors"
                        >
                          {store.storeName}
                        </button>
                      </td>

                      {/* City */}
                      <td className="px-3 py-2 text-gray-700">
                        {store.city}
                      </td>

                      {/* State */}
                      <td className="px-3 py-2 text-gray-700">
                        {store.state}
                      </td>

                      {/* Region */}
                      <td className="px-3 py-2 text-gray-700">
                        {store.region || '—'}
                      </td>

                      {/* Phone */}
                      <td className="px-3 py-2 text-gray-700">
                        {store.storePhone || '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          {store.storeManagerEmail && (
                            <a
                              href={`mailto:${store.storeManagerEmail}`}
                              className="text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Email Store"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => showToast('POG/Schematic viewer coming soon!', 'info')}
                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                            title="View Schematic"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Detail Row */}
                    {isExpanded && (
                      <tr key={`${store.id}-expanded`} className="bg-gradient-to-r from-indigo-50 to-blue-50">
                        <td colSpan={canSelect ? 8 : 7} className="px-8 py-6">
                          <div className="flex gap-6">
                            {/* Store Image - Compact */}
                            <div className="flex-shrink-0">
                              {(() => {
                                const storeImages = (store as any).images || [];
                                const featuredImage = (store as any).featuredImage;
                                const displayImage = featuredImage || (storeImages.length > 0 ? storeImages[0].url : null);
                                
                                return displayImage ? (
                                  <div className="w-32 h-24 bg-white border border-indigo-200 rounded-lg overflow-hidden shadow-sm">
                                    <img
                                      src={displayImage}
                                      alt={store.storeName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-32 h-24 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-gray-300" />
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Store Details - Clean Cards */}
                            <div className="flex-1 grid grid-cols-3 gap-4">
                              {/* Store Info Card */}
                              <div className="bg-white rounded-lg border border-indigo-100 p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-indigo-900 mb-3 uppercase tracking-wide">Store Details</h4>
                                <dl className="space-y-2">
                                  <div>
                                    <dt className="text-xs text-gray-500 mb-0.5">Store ID</dt>
                                    <dd className="text-sm font-semibold text-gray-900 font-mono">{store.storeId}</dd>
                                  </div>
                                  {store.storeNumber && (
                                    <div>
                                      <dt className="text-xs text-gray-500 mb-0.5">Store Number</dt>
                                      <dd className="text-sm font-semibold text-gray-900">#{store.storeNumber}</dd>
                                    </div>
                                  )}
                                  <div>
                                    <dt className="text-xs text-gray-500 mb-0.5">Format</dt>
                                    <dd className="text-sm text-gray-900">{store.storeFormat}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-xs text-gray-500 mb-0.5">Status</dt>
                                    <dd>
                                      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                        store.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {store.isActive ? '● Active' : '○ Inactive'}
                                      </span>
                                    </dd>
                                  </div>
                                  {store.squareFootage && (
                                    <div>
                                      <dt className="text-xs text-gray-500 mb-0.5">Square Footage</dt>
                                      <dd className="text-sm text-gray-900">{store.squareFootage.toLocaleString()} sq ft</dd>
                                    </div>
                                  )}
                                </dl>
                              </div>

                              {/* Location Card */}
                              <div className="bg-white rounded-lg border border-indigo-100 p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-indigo-900 mb-3 uppercase tracking-wide">Location</h4>
                                <dl className="space-y-2">
                                  <div>
                                    <dt className="text-xs text-gray-500 mb-0.5">Address</dt>
                                    <dd className="text-sm text-gray-900 leading-tight">
                                      {store.address}<br />
                                      {store.city}, {store.state} {store.zipCode}
                                    </dd>
                                  </div>
                                  {store.region && (
                                    <div>
                                      <dt className="text-xs text-gray-500 mb-0.5">Region</dt>
                                      <dd className="text-sm text-gray-900">{store.region}</dd>
                                    </div>
                                  )}
                                  {store.district && (
                                    <div>
                                      <dt className="text-xs text-gray-500 mb-0.5">District</dt>
                                      <dd className="text-sm text-gray-900">{store.district}</dd>
                                    </div>
                                  )}
                                </dl>
                              </div>

                              {/* Contact Card */}
                              <div className="bg-white rounded-lg border border-indigo-100 p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-indigo-900 mb-3 uppercase tracking-wide">Contact</h4>
                                <dl className="space-y-2">
                                  {store.storeManagerName && (
                                    <div>
                                      <dt className="text-xs text-gray-500 mb-0.5">Manager</dt>
                                      <dd className="text-sm text-gray-900">{store.storeManagerName}</dd>
                                    </div>
                                  )}
                                  {store.storeManagerEmail && (
                                    <div>
                                      <dt className="text-xs text-gray-500 mb-0.5">Email</dt>
                                      <dd className="text-sm text-indigo-600 hover:text-indigo-700 truncate">
                                        <a href={`mailto:${store.storeManagerEmail}`}>{store.storeManagerEmail}</a>
                                      </dd>
                                    </div>
                                  )}
                                  {store.storePhone && (
                                    <div>
                                      <dt className="text-xs text-gray-500 mb-0.5">Phone</dt>
                                      <dd className="text-sm text-gray-900">{store.storePhone}</dd>
                                    </div>
                                  )}
                                </dl>
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <Button
                                    onClick={() => navigate(`/dashboard/stores/${store.id}`)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                                  >
                                    View Full Details →
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          loadStores();
          setIsImportModalOpen(false);
        }}
      />

      {/* Assign to Project Modal */}
      <AssignToProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        selectedStoreIds={Array.from(selectedStores)}
        onSuccess={() => {
          loadStores();
          setSelectedStores(new Set());
        }}
      />

      {/* Assign to Field Team Modal */}
      <AssignToFieldTeamModal
        isOpen={showFieldTeamModal}
        onClose={() => setShowFieldTeamModal(false)}
        selectedStoreIds={Array.from(selectedStores)}
        onSuccess={() => {
          loadStores();
          setSelectedStores(new Set());
        }}
      />

      {/* Assign to User Modal */}
      <AssignToUserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        selectedStoreIds={Array.from(selectedStores)}
        onSuccess={() => {
          loadStores();
          setSelectedStores(new Set());
        }}
      />

      {/* Delete Selected Confirmation Modal */}
      {showDeleteSelectedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Selected Stores?</h3>
                <p className="text-sm text-gray-600">
                  You are about to delete <span className="font-bold text-red-600">{selectedStores.size} store{selectedStores.size !== 1 ? 's' : ''}</span>.
                </p>
                <p className="text-sm text-red-600 font-semibold mt-2">
                  ⚠️ This action cannot be undone!
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteSelectedModal(false)}
                variant="outline"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedStores.size} Store{selectedStores.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">⚠️ DELETE ALL STORES?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  You are about to delete <span className="font-bold text-red-600">ALL {stores.length} STORES</span> in your organization.
                </p>
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-3">
                  <p className="text-sm font-bold text-red-900">🛑 DANGER ZONE</p>
                  <ul className="text-xs text-red-800 mt-2 space-y-1 list-disc list-inside">
                    <li>All store data will be permanently deleted</li>
                    <li>This action CANNOT be undone</li>
                    <li>You will need to re-import from CSV</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">DELETE ALL</span> to confirm:
                </p>
                <input
                  type="text"
                  placeholder="Type DELETE ALL"
                  onChange={(e) => {
                    const btn = document.getElementById('delete-all-btn') as HTMLButtonElement;
                    if (btn) btn.disabled = e.target.value !== 'DELETE ALL';
                  }}
                  className="w-full mt-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteAllModal(false)}
                variant="outline"
                disabled={deleting}
              >
                Cancel - Keep My Stores
              </Button>
              <Button
                id="delete-all-btn"
                onClick={handleDeleteAll}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={true}
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting All...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All {stores.length} Stores
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
