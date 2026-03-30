'use client';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Brain, Sparkles, AlertTriangle, Lightbulb, Zap, ArrowRight, Bell, CheckCircle, FileText, Users, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useWorkspace, useGA4Data, useGSCData, useIntegrations } from '@/lib/hooks';
import { useWorkspaceCtx } from '@/lib/workspace-context';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';

const PlatformLogo = ({ name, size = 18 }: { name: string; size?: number }) => (
  <img src={`https://cdn.simpleicons.org/${name}`} width={size} height={size} alt={name} style={{ flexShrink: 0 }} />
);

function StatCard({ label, value, sub, color, icon: Icon, loading, platformLogo, change }: {
  label: string; value: string; sub?: string; color: string; icon: any; loading?: boolean; platformLogo?: string; change?: string;
}) {
  return (
    <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        {platformLogo && <PlatformLogo name={platformLogo} size={14} />}
      </div>
      {loading ? (
        <div style={{ height: 32, backgroundColor: '#1A1A1A', borderRadius: 6, marginBottom: 8, width: '55%' }} className="animate-pulse" />
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div style={{ fontSize: 28, fontWeight: 500, color: '#FAFAFA', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'var(--font-mono)' }}>
            {value}
          </div>
          {change && (
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: change.startsWith('+') ? '#10B981' : change.startsWith('-') ? '#EF4444' : '#888888',
            }}>
              {change}
            </span>
          )}
        </div>
      )}
      {sub && <div style={{ fontSize: 12, color: '#555555', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { c } = useTheme();
  const { workspace, loading: wsLoading } = useWorkspaceCtx();
  const { integrations } = useIntegrations(workspace?.id);
  const { data: ga4Resp, loading: ga4Loading } = useGA4Data(workspace?.id, 'overview', 30);
  const { data: gscResp, loading: gscLoading } = useGSCData(workspace?.id, 'keywords', 30);
  const { data: gscOverviewResp } = useGSCData(workspace?.id, 'overview', 30);

  const loading = wsLoading || ga4Loading || gscLoading;

  const ga4Data: any[] = ga4Resp?.data || [];
  const gscKeywords: any[] = gscResp?.keywords || [];
  const gscOverview: any[] = gscOverviewResp?.overview || [];

  const totalSessions = ga4Data.reduce((s, r) => s + (r.sessions || 0), 0);
  const totalUsers = ga4Data.reduce((s, r) => s + (r.users || 0), 0);
  const totalClicks = gscKeywords.reduce((s, k) => s + (k.clicks || 0), 0);
  const totalImpressions = gscKeywords.reduce((s, k) => s + (k.impressions || 0), 0);
  const avgPosition = gscKeywords.length > 0
    ? (gscKeywords.reduce((s, k) => s + (k.position || 0), 0) / gscKeywords.length).toFixed(1) : '—';

  const chartData = gscOverview.slice(-14).map(r => ({
    day: r.date?.slice(5) ?? '',
    clicks: r.clicks || 0,
  }));

  const connectedProviders = integrations.filter(i => i.status === 'connected').map(i => i.provider);
  const hasGA4 = connectedProviders.includes('ga4');
  const hasGSC = connectedProviders.includes('gsc');
  const quickWins = gscKeywords.filter(k => k.position >= 4 && k.position <= 10 && k.ctr < 3).slice(0, 3);
  const topKeywords = gscKeywords.slice(0, 5);

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            Dashboard
          </h1>
          <p style={{ color: '#555555', fontSize: 13, marginTop: 4 }}>
            {connectedProviders.length > 0
              ? `${connectedProviders.length} source${connectedProviders.length > 1 ? 's' : ''} connected · Last 30 days`
              : 'Connect your first integration to see live data'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <StatCard label="Sessions" value={hasGA4 ? totalSessions.toLocaleString() : '—'} sub={hasGA4 ? `${totalUsers.toLocaleString()} users` : 'Connect GA4'} color="#6366F1" icon={BarChart3} loading={loading} platformLogo="googleanalytics" />
        <StatCard label="Organic Clicks" value={hasGSC ? totalClicks.toLocaleString() : '—'} sub={hasGSC ? `${totalImpressions.toLocaleString()} impressions` : 'Connect GSC'} color="#6366F1" icon={TrendingUp} loading={loading} platformLogo="googlesearchconsole" />
        <StatCard label="Avg Position" value={hasGSC ? `#${avgPosition}` : '—'} sub={hasGSC ? `${gscKeywords.length} keywords tracked` : 'Connect GSC'} color="#F59E0B" icon={Target} loading={loading} />
        <StatCard label="Impressions" value={hasGSC ? totalImpressions.toLocaleString() : '—'} sub={hasGSC ? 'Search impressions' : 'Connect GSC'} color="#10B981" icon={BarChart3} loading={loading} />
      </div>

      {/* Anomalies — full width */}
      <AnomaliesWidget workspaceId={workspace?.id} />

      {/* Traffic chart + Top pages */}
      <div className="two-col" style={{ marginBottom: 20, marginTop: 20 }}>
        {/* Traffic chart */}
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>Traffic over time</h3>
              <p style={{ fontSize: 12, color: '#555555', marginTop: 2 }}>Daily clicks — last 14 days</p>
            </div>
            {hasGSC && <PlatformLogo name="googlesearchconsole" size={14} />}
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="transparent" tick={{ fill: '#555555', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis stroke="transparent" tick={{ fill: '#555555', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #222222', borderRadius: 8, color: '#FAFAFA', fontSize: 12 }}
                  itemStyle={{ color: '#FAFAFA' }}
                  labelStyle={{ color: '#888888' }}
                />
                <Area type="monotone" dataKey="clicks" stroke="#6366F1" fill="url(#gDash)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <p style={{ fontSize: 14, color: '#555555' }}>No traffic data yet</p>
              <button onClick={() => router.push('/dashboard/settings')} style={{ fontSize: 13, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Connect Google Search Console →
              </button>
            </div>
          )}
        </div>

        {/* Top pages / keywords table */}
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>Top keywords</h3>
            {hasGSC && (
              <button onClick={() => router.push('/dashboard/seo')} style={{ fontSize: 12, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                View all →
              </button>
            )}
          </div>
          {topKeywords.length > 0 ? (
            <div>
              {topKeywords.map((kw: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < topKeywords.length - 1 ? '1px solid #1A1A1A' : 'none' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)',
                    color: kw.position <= 3 ? '#10B981' : kw.position <= 10 ? '#F59E0B' : '#555555',
                    width: 32, flexShrink: 0,
                  }}>
                    #{Math.round(kw.position)}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: '#888888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kw.query}</span>
                  <span style={{ fontSize: 12, color: '#6366F1', fontWeight: 600, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{kw.clicks}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <p style={{ fontSize: 14, color: '#555555' }}>No keyword data yet</p>
              <button onClick={() => router.push('/dashboard/settings')} style={{ fontSize: 13, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Sync Search Console →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Keywords table + Quick actions */}
      <div className="two-col" style={{ marginBottom: 20 }}>
        {/* Quick wins / keyword table */}
        {quickWins.length > 0 ? (
          <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Brain size={16} color="#6366F1" />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>Quick wins</h3>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action needed</span>
            </div>
            <p style={{ fontSize: 13, color: '#555555', marginBottom: 14, lineHeight: 1.6 }}>Keywords ranking 4-10 with low CTR — optimize title tags to push to page 1.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quickWins.map((kw: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, backgroundColor: '#1A1A1A', border: '1px solid #222222' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B', fontFamily: 'var(--font-mono)', width: 32 }}>#{Math.round(kw.position)}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#888888' }}>{kw.query}</span>
                  <span style={{ fontSize: 12, color: '#555555' }}>{kw.impressions?.toLocaleString()} impr.</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>{kw.ctr?.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 13, color: '#555555' }}>Quick win opportunities will appear here when data is available.</p>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA', marginBottom: 16 }}>Quick actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Run keyword gap analysis', icon: Search, href: '/dashboard/competitors' },
              { label: 'Generate report', icon: FileText, href: '/dashboard/reports' },
              { label: 'Invite team member', icon: Users, href: '/dashboard/settings' },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 8,
                  border: '1px solid #222222', backgroundColor: 'transparent',
                  color: '#FAFAFA', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <action.icon size={15} color="#6366F1" />
                <span style={{ flex: 1 }}>{action.label}</span>
                <ArrowRight size={14} color="#555555" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connect CTA */}
      {connectedProviders.length === 0 && !loading && (
        <div style={{ padding: 24, borderRadius: 12, border: '1px solid #222222', backgroundColor: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#FAFAFA', marginBottom: 4 }}>Connect your first data source</h3>
            <p style={{ fontSize: 13, color: '#555555' }}>Link GSC, GA4, Google Ads, or Meta Ads to populate your dashboard with real data.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/settings')}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#6366F1', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4F46E5')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6366F1')}
          >
            Connect now →
          </button>
        </div>
      )}

      {/* AI Insights widget */}
      <AIInsightsWidget workspaceId={workspace?.id} />
    </div>
  );
}

/* ─── Anomalies Dashboard Widget ─── */

const SEVERITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#888888',
};

function AnomaliesWidget({ workspaceId }: { workspaceId: string | undefined }) {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    fetch(`/api/anomalies?workspace_id=${workspaceId}`)
      .then(r => r.json())
      .then(data => setAnomalies(data.anomalies || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function markAsRead(id: string) {
    await fetch(`/api/anomalies/${id}/read`, { method: 'POST' });
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  }

  if (loading) return null;

  const unread = anomalies.filter(a => !a.is_read);
  const display = anomalies.slice(0, 3);

  return (
    <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={16} color="#EF4444" />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>AI Anomalies</h3>
          {unread.length > 0 && (
            <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 100, backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', fontWeight: 600 }}>
              {unread.length} new
            </span>
          )}
        </div>
        <button
          onClick={() => router.push('/dashboard/alerts')}
          style={{ fontSize: 12, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
        >
          View all →
        </button>
      </div>

      {display.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
          <CheckCircle size={16} color="#10B981" />
          <p style={{ fontSize: 13, color: '#888888' }}>No anomalies detected — everything looks healthy</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {display.map((anomaly: any) => {
            const color = SEVERITY_COLORS[anomaly.severity] || '#888888';
            return (
              <div
                key={anomaly.id}
                onClick={() => !anomaly.is_read && markAsRead(anomaly.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 8,
                  backgroundColor: '#1A1A1A', border: '1px solid #222222',
                  cursor: anomaly.is_read ? 'default' : 'pointer',
                  opacity: anomaly.is_read ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA' }}>{anomaly.title}</p>
                </div>
                <span style={{ fontSize: 11, color: '#555555', flexShrink: 0 }}>
                  {anomaly.created_at ? new Date(anomaly.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── AI Insights Dashboard Widget ─── */

const INSIGHT_DOT_COLORS: Record<string, string> = {
  win: '#10B981',
  warning: '#EF4444',
  opportunity: '#F59E0B',
  tip: '#6366F1',
};

const INSIGHT_ICONS: Record<string, any> = {
  win: TrendingUp,
  warning: AlertTriangle,
  opportunity: Lightbulb,
  tip: Zap,
};

function AIInsightsWidget({ workspaceId }: { workspaceId: string | undefined }) {
  const router = useRouter();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    fetch(`/api/insights?workspace_id=${workspaceId}`)
      .then(r => r.json())
      .then(data => setInsights(data.insights || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function generate() {
    if (!workspaceId) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspaceId }),
      });
      const data = await res.json();
      if (data.insights) setInsights(data.insights);
    } catch {} finally {
      setGenerating(false);
    }
  }

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const top3 = [...insights].sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1)).slice(0, 3);

  if (loading) return null;

  return (
    <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={16} color="#6366F1" />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>AI Insights</h3>
        </div>
        <button
          onClick={() => router.push('/dashboard/ai')}
          style={{ fontSize: 12, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          View all <ArrowRight size={12} />
        </button>
      </div>

      {top3.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <p style={{ fontSize: 13, color: '#555555' }}>No insights generated yet. Let AI analyze your data.</p>
          <button
            onClick={generate}
            disabled={generating}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              backgroundColor: '#6366F1', color: 'white',
              fontSize: 13, fontWeight: 600,
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.7 : 1, whiteSpace: 'nowrap',
              transition: 'background-color 0.2s',
            }}
          >
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {top3.map((insight: any) => {
            const Icon = INSIGHT_ICONS[insight.type] || Zap;
            const dotColor = INSIGHT_DOT_COLORS[insight.type] || '#6366F1';
            return (
              <div key={insight.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, backgroundColor: '#1A1A1A', border: '1px solid #222222' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA', marginBottom: 2 }}>{insight.title}</p>
                  <p style={{ fontSize: 12, color: '#555555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{insight.description}</p>
                </div>
                <Icon size={14} color={dotColor} style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
