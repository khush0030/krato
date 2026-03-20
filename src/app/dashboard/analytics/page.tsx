'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, Clock, MousePointer, Download, TrendingUp, TrendingDown, Zap, AlertCircle, Star } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useWorkspace, useGA4Data } from '@/lib/hooks';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const COLORS = ['#7c3aed','#3b82f6','#22c55e','#f59e0b','#ec4899','#06b6d4'];

function SkeletonBox({ h = 100 }: { h?: number }) {
  return (
    <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', height: `${h}px`, animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ margin: '18px', height: '12px', backgroundColor: '#27272a', borderRadius: '4px', width: '40%' }} />
    </div>
  );
}

function InsightCard({ icon: Icon, color, title, value, sub }: { icon: any; color: string; title: string; value: string; sub: string }) {
  return (
    <div style={{ backgroundColor: '#18181b', border: `1px solid ${color}30`, borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#f4f4f5', marginBottom: 2 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#71717a' }}>{sub}</div>
      </div>
    </div>
  );
}

function exportPagesCSV(pages: any[]) {
  const headers = ['Page', 'Views', 'Bounce Rate'];
  const rows = pages.map((p: any) => [p.page, p.pageviews, `${p.bounceRate}%`]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'lumnix-pages.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const router = useRouter();
  const { workspace, loading: wsLoading } = useWorkspace();
  const workspaceId = workspace?.id;

  const { data: overviewResp, loading: overviewLoading } = useGA4Data(workspaceId, 'overview', days);
  const { data: sourcesResp, loading: sourcesLoading } = useGA4Data(workspaceId, 'sources', days);
  const { data: pagesResp, loading: pagesLoading } = useGA4Data(workspaceId, 'pages', days);

  const loading = wsLoading || overviewLoading || sourcesLoading || pagesLoading;

  const overviewData: any[] = overviewResp?.data || [];
  const sourcesData: any[] = sourcesResp?.data || [];
  const pagesData: any[] = pagesResp?.data || [];

  const hasData = overviewData.length > 0;

  // KPI totals
  const totalSessions = overviewData.reduce((s: number, r: any) => s + (r.sessions || 0), 0);
  const totalUsers = overviewData.reduce((s: number, r: any) => s + (r.users || 0), 0);
  const totalPageviews = overviewData.reduce((s: number, r: any) => s + (r.pageviews || 0), 0);
  const pagesPerSession = totalSessions > 0 ? (totalPageviews / totalSessions).toFixed(1) : '0';

  // Week-over-week comparison
  const half = Math.floor(overviewData.length / 2);
  const thisWeekSessions = overviewData.slice(half).reduce((s: number, r: any) => s + (r.sessions || 0), 0);
  const lastWeekSessions = overviewData.slice(0, half).reduce((s: number, r: any) => s + (r.sessions || 0), 0);
  const wowChange = lastWeekSessions > 0 ? Math.round(((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100) : 0;

  // Anomaly detection — days with sessions > 1.5x average or < 0.5x average
  const avgSessions = totalSessions / (overviewData.length || 1);
  const anomalies = overviewData.filter((r: any) => r.sessions > avgSessions * 1.5 || r.sessions < avgSessions * 0.5);

  // Best day of week
  const dayTotals: Record<string, { total: number; count: number }> = {};
  overviewData.forEach((r: any) => {
    if (!r.date) return;
    const d = new Date(r.date).getDay();
    const day = DAYS[d];
    if (!dayTotals[day]) dayTotals[day] = { total: 0, count: 0 };
    dayTotals[day].total += r.sessions || 0;
    dayTotals[day].count += 1;
  });
  const bestDay = Object.entries(dayTotals).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0];

  // Session quality score (0-100): higher pages/session = better, lower bounce = better
  const avgBounce = pagesData.length > 0 ? pagesData.reduce((s: number, p: any) => s + (p.bounceRate || 0), 0) / pagesData.length : 50;
  const qualityScore = Math.round(Math.min(100, Math.max(0, (parseFloat(pagesPerSession) * 15) + (100 - avgBounce) * 0.5)));

  // Opportunity pages — high views but high bounce rate
  const opportunityPages = pagesData
    .filter((p: any) => (p.bounceRate || 0) > 50 && (p.pageviews || 0) > (totalPageviews / pagesData.length))
    .slice(0, 3);

  // Chart data
  const chartData = overviewData.slice(-14).map((r: any) => ({
    day: r.date?.slice(5) ?? '',
    sessions: r.sessions || 0,
    users: r.users || 0,
    isAnomaly: r.sessions > avgSessions * 1.5 || r.sessions < avgSessions * 0.5,
  }));

  const totalSourceSessions = sourcesData.reduce((s: number, r: any) => s + (r.sessions || 0), 0);
  const sourcesWithPct = sourcesData.slice(0, 6).map((s: any) => ({
    source: s.source,
    sessions: s.sessions,
    pct: totalSourceSessions > 0 ? Math.round((s.sessions / totalSourceSessions) * 100) : 0,
  }));

  // Day of week chart
  const dowChartData = DAYS.map(day => ({
    day,
    avg: dayTotals[day] ? Math.round(dayTotals[day].total / dayTotals[day].count) : 0,
  }));

  return (
    <PageShell title="Web Analytics" description="GA4-powered intelligence — beyond what native dashboards show" icon={BarChart3}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <DateRangePicker value={days} onChange={setDays} />
      </div>

      {loading && (
        <>
          <div className="kpi-grid">{[1,2,3,4].map(i => <SkeletonBox key={i} h={100} />)}</div>
          <div className="two-col-equal"><SkeletonBox h={260} /><SkeletonBox h={260} /></div>
        </>
      )}

      {!loading && !hasData && (
        <EmptyState
          icon={BarChart3}
          title="No GA4 data yet"
          description="Connect and sync Google Analytics 4 in Settings to see real traffic data here."
          actionLabel="Go to Settings"
          onAction={() => router.push('/dashboard/settings')}
        />
      )}

      {!loading && hasData && (
        <>
          {/* KPIs */}
          <div className="kpi-grid" style={{ marginBottom: 20 }}>
            {[
              { label: 'Sessions', value: totalSessions.toLocaleString(), icon: BarChart3, color: '#7c3aed', sub: wowChange !== 0 ? `${wowChange > 0 ? '+' : ''}${wowChange}% vs prev period` : 'No comparison data' },
              { label: 'Users', value: totalUsers.toLocaleString(), icon: Users, color: '#3b82f6', sub: `${(totalUsers / (overviewData.length || 1)).toFixed(0)} avg/day` },
              { label: 'Page Views', value: totalPageviews.toLocaleString(), icon: Clock, color: '#22c55e', sub: `${pagesPerSession} pages per session` },
              { label: 'Quality Score', value: `${qualityScore}/100`, icon: Star, color: qualityScore >= 70 ? '#22c55e' : qualityScore >= 40 ? '#f59e0b' : '#ef4444', sub: qualityScore >= 70 ? 'Good engagement' : qualityScore >= 40 ? 'Room to improve' : 'High bounce rate' },
            ].map(kpi => (
              <div key={kpi.label} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <kpi.icon size={14} color={kpi.color} />
                  <span style={{ fontSize: '12px', color: '#71717a' }}>{kpi.label}</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f4f4f5', marginBottom: 3 }}>{kpi.value}</div>
                <div style={{ fontSize: 11, color: wowChange > 0 && kpi.label === 'Sessions' ? '#22c55e' : wowChange < 0 && kpi.label === 'Sessions' ? '#ef4444' : '#52525b', display: 'flex', alignItems: 'center', gap: 3 }}>
                  {kpi.label === 'Sessions' && wowChange !== 0 && (wowChange > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />)}
                  {kpi.sub}
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
            <InsightCard
              icon={wowChange >= 0 ? TrendingUp : TrendingDown}
              color={wowChange >= 0 ? '#22c55e' : '#ef4444'}
              title="Traffic Momentum"
              value={`${wowChange > 0 ? '+' : ''}${wowChange}%`}
              sub={`This period vs previous ${half} days`}
            />
            <InsightCard
              icon={Star}
              color="#f59e0b"
              title="Best Traffic Day"
              value={bestDay ? bestDay[0] : '—'}
              sub={bestDay ? `Avg ${Math.round(bestDay[1].total / bestDay[1].count)} sessions` : 'Not enough data'}
            />
            <InsightCard
              icon={AlertCircle}
              color="#ef4444"
              title="Anomalies Detected"
              value={`${anomalies.length}`}
              sub={anomalies.length > 0 ? `Days with unusual traffic spikes or drops` : 'Traffic is consistent'}
            />
            <InsightCard
              icon={Zap}
              color="#7c3aed"
              title="Optimization Targets"
              value={`${opportunityPages.length} pages`}
              sub="High traffic + high bounce — fix these first"
            />
          </div>

          <div className="two-col-equal" style={{ marginBottom: 20 }}>
            {/* Sessions chart with anomaly highlights */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5' }}>Sessions & Users</h2>
                {anomalies.length > 0 && (
                  <span style={{ fontSize: 11, color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: 6 }}>
                    ⚡ {anomalies.length} anomalies
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gSess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="sessions" stroke="#7c3aed" fill="url(#gSess)" strokeWidth={2} dot={(props: any) => {
                    if (props.payload?.isAnomaly) {
                      return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill="#f59e0b" stroke="#18181b" strokeWidth={2} />;
                    }
                    return <circle key={props.key} cx={props.cx} cy={props.cy} r={0} fill="none" />;
                  }} />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#52525b' }}>
                  <div style={{ width: 10, height: 2, backgroundColor: '#7c3aed', borderRadius: 1 }} /> Sessions
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#52525b' }}>
                  <div style={{ width: 10, height: 2, backgroundColor: '#3b82f6', borderRadius: 1, borderTop: '2px dashed #3b82f6' }} /> Users
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#52525b' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} /> Anomaly
                </div>
              </div>
            </div>

            {/* Day of week heatmap */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: 4 }}>Best Days to Publish</h2>
              <p style={{ fontSize: 12, color: '#52525b', marginBottom: 16 }}>Average sessions per day of week</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dowChartData} barCategoryGap="20%">
                  <XAxis dataKey="day" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
                  <Bar dataKey="avg" radius={[4,4,0,0]}>
                    {dowChartData.map((entry, i) => (
                      <Cell key={i} fill={bestDay && entry.day === bestDay[0] ? '#7c3aed' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="two-col-equal" style={{ marginBottom: 20 }}>
            {/* Traffic Sources */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: 16 }}>Traffic Sources</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sourcesWithPct.map((s, i) => (
                  <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '13px', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.source || '(direct)'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5', flexShrink: 0 }}>{s.sessions.toLocaleString()}</span>
                    <div style={{ width: '80px', height: '6px', borderRadius: '3px', backgroundColor: '#27272a', overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ width: `${s.pct}%`, height: '100%', borderRadius: '3px', backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#52525b', width: '32px', textAlign: 'right', flexShrink: 0 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunity pages */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Zap size={16} color="#ef4444" />
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5' }}>Fix These Pages First</h2>
              </div>
              <p style={{ fontSize: 12, color: '#52525b', marginBottom: 16 }}>High traffic + high bounce — biggest opportunity</p>
              {opportunityPages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#52525b', fontSize: 13 }}>
                  🎉 No high-bounce pages detected
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {opportunityPages.map((p: any) => (
                    <div key={p.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                      <span style={{ fontSize: 12, color: '#a78bfa', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.page}</span>
                      <div style={{ display: 'flex', gap: 10, flexShrink: 0, marginLeft: 8 }}>
                        <span style={{ fontSize: 11, color: '#71717a' }}>{(p.pageviews || 0).toLocaleString()} views</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>{p.bounceRate}% bounce</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Pages table */}
          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5' }}>All Pages</h2>
              <button onClick={() => exportPagesCSV(pagesData)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#a1a1aa', fontSize: '12px', cursor: 'pointer' }}>
                <Download size={12} /> Export CSV
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Page', 'Views', 'Bounce Rate', 'Signal'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', paddingBottom: '10px', borderBottom: '1px solid #27272a' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {pagesData.map((p: any) => {
                  const isOpportunity = (p.bounceRate || 0) > 50 && (p.pageviews || 0) > (totalPageviews / pagesData.length);
                  const isTopPerformer = (p.bounceRate || 0) < 30 && (p.pageviews || 0) > (totalPageviews / pagesData.length);
                  return (
                    <tr key={p.page} style={{ borderBottom: '1px solid #1e1e22' }}>
                      <td style={{ padding: '10px 0', fontSize: '13px', color: '#a78bfa', fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.page}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: '#f4f4f5', fontWeight: 600 }}>{(p.pageviews || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: (p.bounceRate || 0) > 50 ? '#ef4444' : (p.bounceRate || 0) < 30 ? '#22c55e' : '#a1a1aa' }}>{p.bounceRate ?? 0}%</td>
                      <td style={{ padding: '10px 0' }}>
                        {isOpportunity && <span style={{ fontSize: 11, color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '2px 7px', borderRadius: 4 }}>⚡ Fix</span>}
                        {isTopPerformer && <span style={{ fontSize: 11, color: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', padding: '2px 7px', borderRadius: 4 }}>⭐ Top</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageShell>
  );
}
