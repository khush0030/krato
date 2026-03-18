'use client';
import { Settings, Link2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { PageShell } from '@/components/PageShell';

const integrations = [
  { name: 'Google Search Console', desc: 'Keyword rankings, clicks, impressions', icon: '🔍', connected: false, color: '#4285F4' },
  { name: 'Google Analytics 4', desc: 'Traffic, sessions, conversions', icon: '📊', connected: false, color: '#E37400' },
  { name: 'Google Ads', desc: 'Campaigns, spend, ROAS', icon: '💰', connected: false, color: '#34A853' },
  { name: 'Meta Ads', desc: 'Facebook & Instagram ads', icon: '📱', connected: false, color: '#1877F2' },
];

export default function SettingsPage() {
  return (
    <PageShell title="Settings" description="Manage integrations & workspace" icon={Settings}>
      {/* Integrations */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5', marginBottom: '4px' }}>Integrations</h2>
        <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '20px' }}>Connect your marketing platforms to start syncing data.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {integrations.map(int => (
            <div key={int.name} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                {int.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#f4f4f5' }}>{int.name}</span>
                  {int.connected ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#22c55e' }}><CheckCircle2 size={12} /> Connected</span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#71717a' }}><XCircle size={12} /> Not connected</span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '12px' }}>{int.desc}</p>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px',
                  border: int.connected ? '1px solid #3f3f46' : 'none',
                  backgroundColor: int.connected ? '#27272a' : '#7c3aed',
                  color: int.connected ? '#a1a1aa' : 'white',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}>
                  {int.connected ? 'Disconnect' : <><ExternalLink size={14} /> Connect</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workspace */}
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: '16px' }}>Workspace</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>Workspace Name</label>
            <input defaultValue="Oltaflock AI" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>Primary Domain</label>
            <input defaultValue="oltaflock.ai" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <button style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
          Save Changes
        </button>
      </div>
    </PageShell>
  );
}
