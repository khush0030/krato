'use client';
import { type LucideIcon } from 'lucide-react';

export function PageShell({ title, description, icon: Icon, badge, action, children }: {
  title: string; description: string; icon: LucideIcon; badge?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>{title}</h1>
            {badge && <span style={{ fontSize: '10px', fontWeight: 600, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.02em' }}>{badge}</span>}
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>{description}</p>
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: LucideIcon; title: string; description: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <Icon size={22} color="#7C3AED" />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: '#6b7280', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.6 }}>{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#7C3AED', color: 'white', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
