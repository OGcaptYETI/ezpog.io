import { Users, MapPin, User, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FieldTeam } from '@/types/fieldTeams';

interface FieldTeamCardProps {
  team: FieldTeam;
  onEdit?: (team: FieldTeam) => void;
  onDelete?: (team: FieldTeam) => void;
  onClick?: (team: FieldTeam) => void;
  canEdit?: boolean;
}

export function FieldTeamCard({ team, onEdit, onDelete, onClick, canEdit = false }: FieldTeamCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-5 cursor-pointer"
      onClick={() => onClick?.(team)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
            team.type === 'internal' ? 'bg-blue-100' : 'bg-purple-100'
          }`}>
            <Users className={`w-6 h-6 ${
              team.type === 'internal' ? 'text-blue-600' : 'text-purple-600'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate">{team.name}</h3>
            <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
              team.type === 'internal' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {team.type === 'internal' ? 'Internal Team' : '1099 Contractor'}
            </span>
          </div>
        </div>

        {/* Menu - ALWAYS render the same way */}
        <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className={`w-5 h-5 ${canEdit ? 'text-gray-600' : 'text-gray-300'}`} />
          </button>

          {showMenu && canEdit && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border z-20">
                    <div className="py-1">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(team);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Team
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(team);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Team
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
        </div>
      </div>

      {/* Description */}
      {team.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{team.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Members</p>
            <p className="text-base font-semibold text-gray-900">{team.members.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Stores</p>
            <p className="text-base font-semibold text-gray-900">{team.assignedStores.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-orange-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Leader</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {team.leaderName ? team.leaderName.split(' ')[0] : 'Assigned'}
            </p>
          </div>
        </div>
      </div>

      {/* Leader Info */}
      {team.leaderName && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Team Leader</p>
              <p className="text-sm font-medium text-gray-900 truncate">{team.leaderName}</p>
              {team.leaderEmail && (
                <p className="text-xs text-gray-600 truncate">{team.leaderEmail}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
