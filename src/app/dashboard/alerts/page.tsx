'use client';
import { Bell, Plus, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { PageShell } from '@/components/PageShell';

const mockAlerts = [
  { text: 'Traffic spike: +34% on /pricing page', severity: 'info', time: '2h ago', source: 'GA4', acknowledged: false },
  { text: 'Google Ads CPC increased by 22% vs last week', severity: 'warning', time: '5h ago', source: 'Google Ads', acknowledged: false },
  { text: 'Meta campaign "Spring" exhausted daily budget at 2PM', severity: 'critical', time: '8h ago', source: 'Meta Ads', acknowledged: true },
  { text: 'Keyword "ai automation" moved from #8 to #3', severity: 'success', time: '1d ago', source: 'GSC', acknowledged: true },
  { text: 'SSL certificate expires in 14 days', severity: 'warning', time: '1d ago', source: 'Site Health', acknowledged: false },
  { text: 'Meta Ads frequency >4 on "Retargeting" — audience fatigue risk', severity: 'warning', time: '2d ago', source: 'Meta Ads', acknowledged: true },
];

const severityConfig: Record<string, { icon: typeof AlertCircle; color: string; bg: string }> = {
  critical: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  info: { icon: Info, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  success: { icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
};

export default function AlertsPage() {
  return (
    <PageShell title="Alerts" description="Anomaly detection & threshold alerts" icon={Bell}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Critical', 'Warning', 'Info'].map(f => (
            <button key={f} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: f === 'All' ? '#7c3aed' : '#27272a', color: f === 'All' ? 'white' : '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}>{f}</button>
          ))}
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Create Alert Rule
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {mockAlerts.map((alert, i) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div key={i} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', opacity: alert.acknowledged ? 0.6 : 1 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={config.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: '#e4e4e7', fontWeight: 500 }}>{alert.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#27272a', color: '#a1a1aa' }}>{alert.source}</span>
                  <span style={{ fontSize: '11px', color: '#52525b' }}>{alert.time}</span>
                  {alert.acknowledged && <span style={{ fontSize: '11px', color: '#52525b' }}>✓ Acknowledged</span>}
                </div>
              </div>
              {!alert.acknowledged && (
                <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#a1a1aa', fontSize: '12px', cursor: 'pointer' }}>Acknowledge</button>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
