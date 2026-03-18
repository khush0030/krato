'use client';
import { Target, Eye, MousePointer, DollarSign, ArrowUpRight } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const adSets = [
  { name: 'Lookalike - Website Visitors', status: 'Active', spend: 1840, reach: 42000, impressions: 68000, clicks: 1240, ctr: 1.82, roas: 3.8 },
  { name: 'Interest - Small Business Owners', status: 'Active', spend: 2100, reach: 56000, impressions: 89000, clicks: 1680, ctr: 1.89, roas: 4.1 },
  { name: 'Retargeting - Cart Abandoners', status: 'Active', spend: 680, reach: 8400, impressions: 24000, clicks: 920, ctr: 3.83, roas: 7.2 },
  { name: 'Broad - AI Automation', status: 'Learning', spend: 940, reach: 34000, impressions: 52000, clicks: 480, ctr: 0.92, roas: 1.4 },
];

const spendTrend = Array.from({ length: 14 }, (_, i) => ({
  day: `Mar ${i + 5}`,
  spend: Math.floor(350 + Math.random() * 150),
  roas: +(3.2 + Math.random() * 2).toFixed(1),
}));

export default function MetaAdsPage() {
  return (
    <PageShell title="Meta Ads" description="Facebook & Instagram ad performance" icon={Target}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Spend', value: '$5,560', change: '+8.3%', icon: DollarSign, color: '#f59e0b' },
          { label: 'Reach', value: '140.4K', change: '+12.1%', icon: Eye, color: '#3b82f6' },
          { label: 'Clicks', value: '4,320', change: '+15.7%', icon: MousePointer, color: '#7c3aed' },
          { label: 'ROAS', value: '3.8x', change: '+0.4x', icon: Target, color: '#22c55e' },
        ].map(kpi => (
          <div key={kpi.label} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <kpi.icon size={14} color={kpi.color} />
              <span style={{ fontSize: '12px', color: '#71717a' }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f4f4f5' }}>{kpi.value}</div>
            <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ArrowUpRight size={12} /> {kpi.change}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px', marginBottom: '24px' }}>
        {/* Ad Sets Table */}
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: '16px' }}>Ad Sets</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Ad Set', 'Status', 'Spend', 'Reach', 'CTR', 'ROAS'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', paddingBottom: '10px', borderBottom: '1px solid #27272a' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {adSets.map(ad => (
                <tr key={ad.name} style={{ borderBottom: '1px solid #1e1e22' }}>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#e4e4e7', fontWeight: 500, maxWidth: '200px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ad.name}</div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', backgroundColor: ad.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: ad.status === 'Active' ? '#22c55e' : '#f59e0b' }}>{ad.status}</span>
                  </td>
                  <td style={{ padding: '10px 8px', fontSize: '13px', color: '#a1a1aa' }}>${ad.spend.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', fontSize: '13px', color: '#a1a1aa' }}>{(ad.reach / 1000).toFixed(1)}K</td>
                  <td style={{ padding: '10px 8px', fontSize: '13px', color: '#a1a1aa' }}>{ad.ctr}%</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: 600, color: ad.roas >= 4 ? '#22c55e' : ad.roas >= 2 ? '#f59e0b' : '#ef4444' }}>{ad.roas}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Spend vs ROAS chart */}
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: '16px' }}>Spend Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={spendTrend}>
              <defs>
                <linearGradient id="gMeta" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
              <Area type="monotone" dataKey="spend" stroke="#3b82f6" fill="url(#gMeta)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageShell>
  );
}
