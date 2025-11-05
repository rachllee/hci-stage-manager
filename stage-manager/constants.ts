import { Equipment, Issue } from './types';

// Color palette from the style guide
export const COLORS = {
  nightSky: '#1A1D29',
  shadowBlue: '#2D3142',
  mintAccent: '#4ECCA3',  // Green - resolved
  amberHighlight: '#FFB84D',  // Yellow - in progress
  signalCoral: '#FF6B6B',  // Red - needs attention
  glacier: '#A8DADC',
  foam: '#F1FAEE',
  slateMist: '#94A3B8',
} as const;

// Status color mapping (Task #5 requirement)
export const STATUS_COLORS = {
  'resolved': COLORS.mintAccent,  // Green
  'in-progress': COLORS.amberHighlight,  // Yellow
  'needs-attention': COLORS.signalCoral,  // Red
  'problem-detected': COLORS.signalCoral,  // Red
  'custom': COLORS.slateMist,  // Gray as default (will be overridden)
} as const;

// Font resources
export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  mono: 'RobotoMono-Regular',
} as const;

// Mock data for equipment on stage - start empty
export const MOCK_EQUIPMENT: Equipment[] = [];

// Mock data for issues - start with empty
export const MOCK_ISSUES: Issue[] = [];

// Team members for assignment - will be updated dynamically
export let TEAM_MEMBERS = [
  { id: 'kp', name: 'KP', initials: 'KP' },
  { id: 'an', name: 'AN', initials: 'AN' },
  { id: 'sj', name: 'SJ', initials: 'SJ' },
];

// Function to update team member
export const updateTeamMember = (oldInitials: string, newName: string) => {
  const newInitials = newName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const newId = newInitials.toLowerCase();
  
  TEAM_MEMBERS = TEAM_MEMBERS.map(member => 
    member.initials === oldInitials 
      ? { id: newId, name: newName, initials: newInitials }
      : member
  );
  
  return { newInitials, newId };
};