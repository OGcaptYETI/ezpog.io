import { Timestamp } from 'firebase/firestore';

export type TeamType = 'internal' | 'contractor';

export interface FieldTeam {
  id: string;
  name: string;
  type: TeamType;
  leaderId: string;
  leaderName?: string;
  leaderEmail?: string;
  members: string[]; // Array of user IDs
  memberDetails?: Array<{
    uid: string;
    name: string;
    email: string;
    role: string;
  }>;
  assignedStores: string[]; // Array of store IDs
  organizationId: string;
  description?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateFieldTeamData {
  name: string;
  type: TeamType;
  leaderId: string;
  members: string[];
  description?: string;
  organizationId: string;
  createdBy: string;
}

export interface UpdateFieldTeamData {
  name?: string;
  type?: TeamType;
  leaderId?: string;
  members?: string[];
  description?: string;
  assignedStores?: string[];
}
