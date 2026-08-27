import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TableHTMLAttributes } from 'react';

export function Button({ variant = 'primary', loading = false, children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean }) {
  return <button className={`classe-button classe-button-${variant} ${className}`} disabled={loading || props.disabled} {...props}>{loading ? 'Chargement…' : children}</button>;
}

export function Card({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) { return <section className={`classe-card ${className}`} {...props}>{children}</section>; }
export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: BadgeVariant }) { return <span className={`classe-badge classe-badge-${variant}`}>{children}</span>; }
export function Avatar({ name, src, size = 'md' }: { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg' }) { return src ? <img className={`classe-avatar classe-avatar-${size}`} src={src} alt={name} /> : <span className={`classe-avatar classe-avatar-${size}`} aria-label={name}>{name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>; }
export function ProgressBar({ value, label }: { value: number; label?: string }) { const safeValue = Math.max(0, Math.min(100, value)); return <div className="classe-progress" aria-label={label ?? `${safeValue}%`}><span style={{ width: `${safeValue}%` }} /></div>; }
export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) { if (!open) return null; return <div className="classe-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="classe-modal" role="dialog" aria-modal="true" aria-labelledby="classe-modal-title"><header><h2 id="classe-modal-title">{title}</h2><button type="button" onClick={onClose} aria-label="Fermer">×</button></header>{children}</div></div>; }
export function Toast({ message, tone = 'info', onClose }: { message: string; tone?: 'success' | 'error' | 'warning' | 'info'; onClose?: () => void }) { return <div className={`classe-toast classe-toast-${tone}`} role="status"><span>{message}</span>{onClose && <button type="button" onClick={onClose} aria-label="Fermer">×</button>}</div>; }
export function Input({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) { return <label className="classe-input">{label && <span>{label}</span>}<input {...props} aria-invalid={Boolean(error)} />{error && <small>{error}</small>}</label>; }
export function Select({ label, error, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) { return <label className="classe-input">{label && <span>{label}</span>}<select {...props}>{children}</select>{error && <small>{error}</small>}</label>; }
export function Table({ children, ...props }: TableHTMLAttributes<HTMLTableElement>) { return <div className="classe-table-wrap"><table {...props}>{children}</table></div>; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="classe-empty-state"><strong>{title}</strong><p>{description}</p>{action}</div>; }

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
