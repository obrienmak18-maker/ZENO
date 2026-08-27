export const classeTokens = {
  colors: {
    primary: '#7C3AED',
    primarySoft: '#F5F0FF',
    accent: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    background: '#F5F0FF',
    surface: '#FFFFFF',
    text: '#1E293B',
    muted: '#64748B',
  },
  radii: { card: 24, control: 14, pill: 999 },
  motion: { standard: '200ms ease-in-out' },
} as const;

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export interface UiButtonProps { variant?: ButtonVariant; loading?: boolean; disabled?: boolean; }

export * from './components';
