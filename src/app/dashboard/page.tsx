'use client';
import { BarChart3, DollarSign, TrendingUp, Target, ArrowUpRight, ArrowDownRight, Zap, Brain, Link2, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const kpis = [
  { label: 'Total Traffic', value: '124,832', change: '+12.4%', up: true, icon: BarChart3, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  { label: 'Ad Spend', value: '$8,420', change: '-3.2%', up: false, icon: DollarSign, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { label: 'Conversions', value: '3,847', change: '+18.6%', up: true, icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  { label: 'Overall ROAS', value: '4.2x', change: '+0.8x', up: true, icon: Target, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
];

const trafficData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  organic: Math.floor(1800 + Math.random() * 800 + i * 30),
  paid: Math.floor(800 + Math.random() * 400 + i * 15),
  social: Math.floor(400 + Math.random() * 200),
}));

const channelData = [
  { name: 'Organic', value: 48, color: '#22c55e' },
  { name: 'Paid Search', value: 28, color: '#7c3aed' },
  { name: 'Social', value: 14, color: '#3b82f6' },
  { name: 'Direct', value: 10, color: '#f59e0b' },
];

const recentAlerts = [
  { text: 'Traffic spike: +34% on /pricing page', severity: 'info', time: '2h ago' },
  { text: 'Google Ads CPC increased by 22%', severity: 'warning', time: '5h ago' },
  { text: 'Meta Ads campaign "Spring" exhausted budget', severity: 'critical', time: '8h ago' },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f4f4f5', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ color: '#71717a', fontSize: '14px', marginTop: '4px' }}>Your marketing performance at a glance</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600, color: kpi.up ? '#22c55e' : '#ef4444', backgroundColor: kpi.up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: '20px' }}>
                {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.change}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#f4f4f5', letterSpacing: '-0.5px' }}>{kpi.value}</div>
            <div style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', marginBottom: '24px' }}>
        {/* Traffic Trend */}
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5' }}>Traffic Overview</h2>
              <p style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>Last 30 days</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[{ label: 'Organic', color: '#22c55e' }, { label: 'Paid', color: '#7c3aed' }, { label: 'Social', color: '#3b82f6' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: l.color }} />
                  <span style={{ fontSize: '12px', color: '#71717a' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="gOrg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.2} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient>
                <linearGradient id="gSoc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
              <Area type="monotone" dataKey="organic" stroke="#22c55e" fill="url(#gOrg)" strokeWidth={2} />
              <Area type="monotone" dataKey="paid" stroke="#7c3aed" fill="url(#gPaid)" strokeWidth={2} />
              <Area type="monotone" dataKey="social" stroke="#3b82f6" fill="url(#gSoc)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Breakdown */}
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: '4px' }}>Channel Breakdown</h2>
          <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>Traffic by source</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={channelData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                  {channelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {channelData.map(ch => (
              <div key={ch.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: ch.color }} />
                <span style={{ flex: 1, fontSize: '13px', color: '#a1a1aa' }}>{ch.name}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5' }}>{ch.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Recent Alerts */}
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5' }}>Recent Alerts</h2>
            <a href="/dashboard/alerts" style={{ fontSize: '13px', color: '#7c3aed', textDecoration: 'none' }}>View all →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentAlerts.map((alert, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', borderRadius: '10px', backgroundColor: '#1c1c1f', border: '1px solid #27272a' }}>
                <AlertCircle size={16} style={{ color: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#d4d4d8' }}>{alert.text}</div>
                  <div style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: '16px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Run SEO Audit', desc: 'Analyze any website', icon: Zap, href: '/dashboard/seo' },
              { label: 'Connect Integration', desc: 'GSC, GA4, Ads', icon: Link2, href: '/dashboard/settings' },
              { label: 'Ask AI', desc: 'Query your data', icon: Brain, href: '/dashboard/ai' },
            ].map(action => (
              <a key={action.label} href={action.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '10px', backgroundColor: '#1c1c1f', border: '1px solid #27272a', textDecoration: 'none', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <action.icon size={18} color="#a78bfa" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#f4f4f5' }}>{action.label}</div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>{action.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
