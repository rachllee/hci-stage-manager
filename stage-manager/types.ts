// Type definitions for the Stage Manager app

export type EquipmentType = 'mic' | 'light';

export type IssueStatus = 'resolved' | 'in-progress' | 'needs-attention' | 'problem-detected' | 'custom';

export interface CustomStatus {
  name: string;
  color: string;
}

export interface Equipment {
  id: string;
  type: EquipmentType;
  label: string;
  position: { x: number; y: number };
  status: IssueStatus;
  crew?: 'sound' | 'lighting' | 'stage';
  icon?: string; // SF Symbol icon name or 'other' for initials
}

export interface Issue {
  id: string;
  equipmentId: string;
  equipmentLabel: string;
  title: string;
  description?: string;
  status: IssueStatus;
  customStatus?: CustomStatus;
  reportedBy: string;
  reportedAt: Date;
  estimatedResolutionTime?: number; // in minutes
  assignedTo?: string[]; // Array of user IDs
}

export type FilterType = 'all' | 'sound' | 'lighting' | 'stage';