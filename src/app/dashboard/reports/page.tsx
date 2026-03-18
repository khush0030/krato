'use client';
import { FileText, Plus, Download, Calendar, Mail } from 'lucide-react';
import { PageShell } from '@/components/PageShell';

const mockReports = [
  { name: 'Weekly Performance Digest', schedule: 'Every Monday', lastRun: 'Mar 17', channels: ['GSC', 'GA4', 'Ads'], status: 'active' },
  { name: 'Monthly SEO Report', schedule: 'First of month', lastRun: 'Mar 1', channels: ['GSC'], status: 'active' },
  { name: 'Ad Spend Summary', schedule: 'Weekly', lastRun: 'Mar 14', channels: ['Google Ads', 'Meta Ads'], status: 'paused' },
];

export default function ReportsPage() {
  return (
    <PageShell title="Reports" description="Scheduled & on-demand marketing reports" icon={FileText}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Create Report
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mockReports.map(r => (
          <div key={r.name} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={20} color="#a78bfa" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#f4f4f5' }}>{r.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#71717a' }}><Calendar size={12} /> {r.schedule}</span>
                <span style={{ fontSize: '12px', color: '#52525b' }}>Last: {r.lastRun}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {r.channels.map(ch => (
                    <span key={ch} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#27272a', color: '#a1a1aa' }}>{ch}</span>
                  ))}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '10px', backgroundColor: r.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(113,113,122,0.1)', color: r.status === 'active' ? '#22c55e' : '#71717a' }}>{r.status}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#a1a1aa', cursor: 'pointer', display: 'flex' }}><Download size={14} /></button>
              <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#a1a1aa', cursor: 'pointer', display: 'flex' }}><Mail size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
