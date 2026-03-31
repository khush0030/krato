'use client';
import { useState, useEffect } from 'react';
import { GitBranch, BarChart3, TrendingUp, Loader2, Info } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { useWorkspaceCtx } from '@/lib/workspace-context';
import { useTheme } from '@/lib/theme';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MODELS = [
  { id: 'last_touch', label: 'Last Touch', desc: 'Full credit to the last touchpoint before conversion' },
  { id: 'first_touch', label: 'First Touch', desc: 'Full credit to the first touchpoint in the journey' },
  { id: 'linear', label: 'Linear', desc: 'Credit split equally across all touchpoints' },
];

const CHANNEL_COLORS: Record<string, string> = {
  'Organic Search': '#10B981',
  'Paid Search': '#6366F1',
  'Social Media': '#EF4444',
  'Email': '#F59E0B',
  'Direct': '#888888',
  'Referral': '#10B981',
  'Paid Social': '#EF4444',
};

export default function AttributionPage() {
  const { c } = useTheme();
  const { workspace } = useWorkspaceCtx();
  const [model, setModel] = useState('last_touch');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspace?.id) return;
    setLoading(true);
    fetch(`/api/data/attribution?workspace_id=${workspace.id}&model=${model}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [workspace?.id, model]);

  const breakdown = data?.breakdown || [];
  const totalValue = data?.totalValue || 0;
  const totalConversions = data?.totalConversions || 0;

  return (
    <PageShell title="Attribution" description="Understand which channels drive conversions" icon={GitBranch}>
      {/* Model selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {MODELS.map(m => (
          <button
            key={m.id}
            onClick={() => setModel(m.id)}
            style={{
              padding: '10px 18px', borderRadius: 10,
              border: `1px solid ${model === m.id ? c.accent : c.borderStrong}`,
              backgroundColor: model === m.id ? c.accentSubtle : 'transparent',
              color: model === m.id ? c.accent : c.textSecondary,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
            onMouseEnter={e => { if (model !== m.id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = c.surfaceElevated; }}
            onMouseLeave={e => { if (model !== m.id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
          >
            {m.label}
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontSize: 12, color: c.textMuted }}>
          <Info size={13} />
          {MODELS.find(m => m.id === model)?.desc}
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid-3" style={{ marginBottom: 24 }}>
        <div style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Total Value</div>
          <div className="kpi-value" style={{ color: c.text, fontFamily: 'var(--font-mono)' }}>${totalValue.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Conversions</div>
          <div className="kpi-value" style={{ color: c.text, fontFamily: 'var(--font-mono)' }}>{totalConversions}</div>
        </div>
        <div style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Channels</div>
          <div className="kpi-value" style={{ color: c.text, fontFamily: 'var(--font-mono)' }}>{breakdown.length}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={24} color={c.accent} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="two-col-equal">
          {/* Bar chart */}
          <div style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={16} color={c.accent} />
              Channel Breakdown
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 11, fill: c.textMuted }} />
                  <YAxis type="category" dataKey="channel" width={110} tick={{ fontSize: 11, fill: c.textSecondary }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 12, color: c.text }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                    {breakdown.map((entry: any, index: number) => (
                      <Cell key={index} fill={CHANNEL_COLORS[entry.channel] || '#6366F1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top channels table */}
          <div style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color={c.success} />
              Top Converting Channels
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Table header */}
              <div style={{ display: 'flex', padding: '8px 12px', borderBottom: `2px solid ${c.border}` }}>
                <div style={{ flex: 2, fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Channel</div>
                <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Value</div>
                <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Conv.</div>
                <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Share</div>
              </div>
              {/* Table rows */}
              {breakdown.map((ch: any, i: number) => {
                const pct = totalValue > 0 ? ((ch.value / totalValue) * 100).toFixed(1) : '0';
                return (
                  <div
                    key={ch.channel}
                    style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderBottom: i < breakdown.length - 1 ? `1px solid ${c.border}` : 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = c.surfaceElevated}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}
                  >
                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: CHANNEL_COLORS[ch.channel] || c.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{ch.channel}</span>
                    </div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: c.text, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${ch.value.toLocaleString()}</div>
                    <div style={{ flex: 1, fontSize: 13, color: c.textSecondary, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{ch.conversions}</div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, backgroundColor: c.accentSubtle, color: c.accent, fontFamily: 'var(--font-mono)' }}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info note */}
      <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 10, backgroundColor: c.bgCard, border: `1px solid ${c.border}`, fontSize: 12, color: c.textSecondary, lineHeight: 1.6 }}>
        <strong style={{ color: c.textSecondary }}>About attribution models:</strong> Last Touch credits the final interaction before conversion. First Touch credits the initial discovery channel. Linear distributes credit equally across all touchpoints. Each model tells a different story about your channel performance.
      </div>
    </PageShell>
  );
}
