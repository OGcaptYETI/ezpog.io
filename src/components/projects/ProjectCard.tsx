import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types';
import { MoreVertical, Edit, Trash2, Lock, Calendar, Users, TrendingUp, UserPlus } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onAssignTeams?: (project: Project) => void;
  formatDate: (date: any) => string;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

export function ProjectCard({
  project,
  viewMode,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onAssignTeams,
  formatDate,
  getStatusColor,
  getPriorityColor,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  const handleCardClick = () => {
    navigate(`/dashboard/projects/${project.id}`);
  };

  const ActionsMenu = () => (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpenMenu(!openMenu)}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
      
      {openMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          {canEdit ? (
            <button
              onClick={() => { onEdit(project); setOpenMenu(false); }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <button
              disabled
              className="w-full px-4 py-2 text-left text-gray-400 flex items-center gap-2 cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              Edit (No Permission)
            </button>
          )}
          {onAssignTeams && canEdit && (
            <button
              onClick={() => { onAssignTeams(project); setOpenMenu(false); }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-t"
            >
              <UserPlus className="w-4 h-4" />
              Assign Teams
            </button>
          )}
          {canDelete ? (
            <button
              onClick={() => { onDelete(project.id); setOpenMenu(false); }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          ) : (
            <button
              disabled
              className="w-full px-4 py-2 text-left text-gray-400 flex items-center gap-2 cursor-not-allowed border-t"
            >
              <Lock className="w-4 h-4" />
              Delete (No Permission)
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (viewMode === 'grid') {
    return (
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 flex flex-col h-[440px] cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.name}</h3>
            <p className="text-sm text-gray-500">{project.projectId}</p>
          </div>
          <ActionsMenu />
        </div>

        {/* Description - Fixed height */}
        <div className="mb-3 h-10">
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
            {project.priority}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            {project.projectType.replace('_', ' ')}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{project.completionPercentage || 0}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{project.teamMembers?.length || 0}</div>
            <div className="text-xs text-gray-500">Team</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{project.assignedStores?.length || 0}</div>
            <div className="text-xs text-gray-500">Stores</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{project.completedStores || 0} / {project.assignedStores?.length || 0} stores</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${project.completionPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Dates - Push to bottom */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Start: {formatDate(project.startDate)}</span>
            <span>Target: {formatDate(project.targetEndDate)}</span>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW - Horizontal Layout
  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 flex items-center gap-4 cursor-pointer"
    >
      {/* Left: Name & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
          <span className="text-sm text-gray-500 whitespace-nowrap">{project.projectId}</span>
        </div>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
            {project.priority}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            {project.projectType.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Middle: Stats */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{project.completionPercentage || 0}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{project.teamMembers?.length || 0}</div>
          <div className="text-xs text-gray-500">Team</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{project.totalStores || 0}</div>
          <div className="text-xs text-gray-500">Stores</div>
        </div>
      </div>

      {/* Right: Dates & Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs text-gray-500">Start: {formatDate(project.startDate)}</div>
          <div className="text-xs text-gray-500">Target: {formatDate(project.targetEndDate)}</div>
        </div>
        <ActionsMenu />
      </div>
    </div>
  );
}
