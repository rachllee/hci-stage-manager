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

export type TeamMember = { id: string; name: string; initials: string };

// Default team members for assignment
export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  { id: 'kp', name: 'KP', initials: 'KP' },
  { id: 'an', name: 'AN', initials: 'AN' },
  { id: 'sj', name: 'SJ', initials: 'SJ' },
];

// Derive initials from a name; supports single-word names by using the first two characters.
export const getInitials = (name: string, fallback = '') => {
  const trimmed = name.trim();
  if (!trimmed) return fallback;

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return parts
      .map((part) => part[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  const firstWord = parts[0];
  const cleaned = firstWord.replace(/[^A-Za-z0-9]/g, '');
  const initials = cleaned.slice(0, 2).toUpperCase();
  return initials || fallback;
};

// No shared mutable team member list here; keep state inside components.
