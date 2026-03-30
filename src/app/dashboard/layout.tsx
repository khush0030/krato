'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Search, BarChart3, DollarSign,
  Target, Brain, Eye, FileText, Bell, Settings,
  Menu, X, LogOut, ChevronDown, Plus, GitBranch, RefreshCw, User
} from 'lucide-react';
import { WorkspaceProvider, useWorkspaceCtx } from '@/lib/workspace-context';
import { ThemeProvider, useTheme } from '@/lib/theme';

const navGroups = [
  {
    label: 'Analytics',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/dashboard/seo', label: 'SEO', icon: Search },
    ],
  },
  {
    label: 'Advertising',
    items: [
      { href: '/dashboard/google-ads', label: 'Google Ads', icon: DollarSign },
      { href: '/dashboard/meta-ads', label: 'Meta Ads', icon: Target },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/dashboard/ai', label: 'AI Assistant', icon: Brain },
      { href: '/dashboard/competitors', label: 'Competitors', icon: Eye },
      { href: '/dashboard/attribution', label: 'Attribution', icon: GitBranch },
    ],
  },
  {
    label: '',
    items: [
      { href: '/dashboard/reports', label: 'Reports', icon: FileText },
      { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function WorkspaceSwitcher({ workspace, accent }: { workspace: any; accent: string }) {
  const [open, setOpen] = useState(false);
  const initials = workspace?.name ? workspace.name.substring(0, 2).toUpperCase() : 'LX';

  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 8,
          border: '1px solid #222222', backgroundColor: '#111111',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {workspace?.logo_url ? (
          <img src={workspace.logo_url} alt="Logo" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'white', flexShrink: 0 }}>{initials}</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#FAFAFA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {workspace?.name || 'My Workspace'}
          </div>
        </div>
        <ChevronDown size={12} color="#555555" style={{ flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, backgroundColor: '#1A1A1A', border: '1px solid #222222', borderRadius: 10, overflow: 'hidden', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {workspace?.logo_url ? (
              <img src={workspace.logo_url} alt="Logo" style={{ width: 22, height: 22, borderRadius: 5, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'white' }}>{initials}</div>
            )}
            <span style={{ fontSize: 12, color: '#FAFAFA', flex: 1 }}>{workspace?.name || 'My Workspace'}</span>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div style={{ borderTop: '1px solid #222222', padding: '4px 6px' }}>
            <button onClick={() => setOpen(false)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 4px', borderRadius: 6, border: 'none', backgroundColor: 'transparent', color: '#555555', fontSize: 12, cursor: 'pointer' }}>
              <Plus size={12} /> Add workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarInner({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { workspace } = useWorkspaceCtx();
  const accent = workspace?.brand_color || '#6366F1';

  const isActive = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <div style={{ width: 240, minHeight: '100vh', backgroundColor: '#0A0A0A', display: 'flex', flexDirection: 'column', padding: '20px 12px', flexShrink: 0, boxShadow: '1px 0 0 #1A1A1A' }}>
      {/* Logo */}
      <div style={{ padding: '2px 10px 18px' }}>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.03em', color: '#FAFAFA' }}>
          <span style={{ color: '#6366F1' }}>L</span>umnix
        </span>
      </div>

      <WorkspaceSwitcher workspace={workspace} accent={accent} />

      <div style={{ height: 1, backgroundColor: '#1A1A1A', margin: '12px 0' }} />

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 8 }}>
            {group.label && (
              <div style={{ fontSize: 11, fontWeight: 600, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 10px 4px' }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); router.push(item.href); onClose?.(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    color: active ? '#FAFAFA' : '#888888',
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    textDecoration: 'none', cursor: 'pointer',
                    backgroundColor: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <item.icon size={16} color={active ? '#6366F1' : '#555555'} strokeWidth={active ? 2 : 1.75} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 12, marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            backgroundColor: '#1A1A1A', border: '1px solid #222222',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={14} color="#888888" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#FAFAFA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {workspace?.name || 'Workspace'}
            </div>
            <div style={{ fontSize: 11, color: '#555555' }}>Settings</div>
          </div>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555555', padding: 2 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#888888')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555555')}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0A0A0A' }}>
      <div style={{ display: 'none' }} className="desktop-sidebar">
        <SidebarInner />
      </div>
      <style>{`.desktop-sidebar { display: flex !important; } @media (max-width: 768px) { .desktop-sidebar { display: none !important; } }`}</style>

      {/* Mobile header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, backgroundColor: '#0A0A0A', borderBottom: '1px solid #222222', padding: '12px 16px', display: 'none' }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#FAFAFA' }}>
            <span style={{ color: '#6366F1' }}>L</span>umnix
          </span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#888888', cursor: 'pointer' }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .mobile-header { display: block !important; } }`}</style>

      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'relative', zIndex: 51 }}>
            <SidebarInner onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <main style={{ flex: 1, overflow: 'auto', maxHeight: '100vh', backgroundColor: '#0A0A0A' }} className="main-content">
        <div style={{ padding: 32 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <ThemeProvider>
        <DashboardInner>{children}</DashboardInner>
      </ThemeProvider>
    </WorkspaceProvider>
  );
}
