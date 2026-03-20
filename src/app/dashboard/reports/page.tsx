'use client';
import { useState } from 'react';
import { FileText, Download, BarChart3, Search, TrendingUp, Loader2, CheckCircle2, FileDown } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { useWorkspace, useGSCData, useGA4Data } from '@/lib/hooks';

const reportTypes = [
  {
    id: 'seo', label: 'SEO Report', icon: Search, color: '#7c3aed',
    desc: 'Keywords, positions, CTR, quick wins, opportunities',
    sections: ['Top Keywords', 'Position Distribution', 'Quick Wins', 'Low CTR Opportunities'],
  },
  {
    id: 'analytics', label: 'Traffic Report', icon: BarChart3, color: '#3b82f6',
    desc: 'Sessions, users, traffic sources, top pages',
    sections: ['Overview KPIs', 'Traffic Sources', 'Top Pages', 'Traffic Trend'],
  },
  {
    id: 'full', label: 'Full Marketing Report', icon: TrendingUp, color: '#22c55e',
    desc: 'All connected sources — SEO + Analytics combined',
    sections: ['Executive Summary', 'SEO Performance', 'Traffic Analytics', 'AI Recommendations'],
  },
];

function generateCSV(type: string, gscKeywords: any[], ga4Data: any[], workspace: any) {
  const date = new Date().toISOString().slice(0, 10);
  const header = `Lumnix Report — ${workspace?.name || 'My Workspace'}\nGenerated: ${new Date().toLocaleString()}\n\n`;

  if (type === 'seo') {
    const cols = ['Keyword', 'Position', 'Impressions', 'Clicks', 'CTR', 'Signal'];
    const rows = gscKeywords.map((kw: any) => {
      const sig = kw.position <= 3 ? 'Top 3' : (kw.position >= 4 && kw.position <= 10 && kw.ctr < 3) ? 'Quick Win' : (kw.impressions > 500 && kw.ctr < 1) ? 'Low CTR' : '';
      return [kw.query, Math.round(kw.position), kw.impressions, kw.clicks, `${kw.ctr?.toFixed(1)}%`, sig];
    });
    return { content: header + [cols, ...rows].map(r => r.join(',')).join('\n'), filename: `lumnix-seo-${date}.csv`, mime: 'text/csv' };
  }

  if (type === 'analytics') {
    const sessionRows = ga4Data.filter((r: any) => r.metric_type === 'sessions');
    const dateMap: Record<string, number> = {};
    sessionRows.forEach((r: any) => { dateMap[r.date] = (dateMap[r.date] || 0) + r.value; });
    const cols = ['Date', 'Sessions'];
    const rows = Object.entries(dateMap).sort().map(([d, s]) => [d, s]);
    return { content: header + [cols, ...rows].map(r => r.join(',')).join('\n'), filename: `lumnix-analytics-${date}.csv`, mime: 'text/csv' };
  }

  if (type === 'full') {
    const totalClicks = gscKeywords.reduce((s: number, k: any) => s + k.clicks, 0);
    const totalImpressions = gscKeywords.reduce((s: number, k: any) => s + k.impressions, 0);
    const avgPosition = gscKeywords.length > 0 ? (gscKeywords.reduce((s: number, k: any) => s + k.position, 0) / gscKeywords.length).toFixed(1) : 'N/A';
    const quickWins = gscKeywords.filter((k: any) => k.position >= 4 && k.position <= 10 && k.ctr < 3);
    const totalSessions = ga4Data.filter((r: any) => r.metric_type === 'sessions').reduce((s: number, r: any) => s + r.value, 0);

    const summary = [
      `EXECUTIVE SUMMARY`,
      `Workspace: ${workspace?.name || 'My Workspace'}`,
      `Report Period: Last 30 days`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `SEO PERFORMANCE`,
      `Total Clicks: ${totalClicks.toLocaleString()}`,
      `Total Impressions: ${totalImpressions.toLocaleString()}`,
      `Average Position: #${avgPosition}`,
      `Keywords Tracked: ${gscKeywords.length}`,
      `Quick Win Opportunities: ${quickWins.length}`,
      ``,
      `TRAFFIC ANALYTICS`,
      `Total Sessions: ${totalSessions.toLocaleString()}`,
      ``,
      `AI RECOMMENDATIONS`,
      quickWins.length > 0 ? `• Improve titles for ${quickWins.length} keywords ranking positions 4-10 with low CTR` : `• CTR performance looks healthy`,
      totalSessions > 0 ? `• ${totalSessions.toLocaleString()} sessions recorded — review top traffic sources` : `• Connect GA4 for traffic insights`,
      gscKeywords.filter((k: any) => k.position <= 3).length > 0 ? `• ${gscKeywords.filter((k: any) => k.position <= 3).length} keywords in top 3 — protect these with regular content updates` : `• Focus on pushing more keywords to page 1`,
      ``,
      `TOP 20 KEYWORDS`,
      ['Keyword', 'Position', 'Clicks', 'Impressions', 'CTR'].join(','),
      ...gscKeywords.slice(0, 20).map((k: any) => [k.query, Math.round(k.position), k.clicks, k.impressions, `${k.ctr?.toFixed(1)}%`].join(',')),
    ].join('\n');

    return { content: summary, filename: `lumnix-full-report-${date}.txt`, mime: 'text/plain' };
  }

  return null;
}

function generatePDF(type: string, gscKeywords: any[], ga4Data: any[], workspace: any) {
  const date = new Date().toLocaleString();
  const name = workspace?.name || 'My Workspace';
  const totalClicks = gscKeywords.reduce((s: number, k: any) => s + k.clicks, 0);
  const totalImpressions = gscKeywords.reduce((s: number, k: any) => s + k.impressions, 0);
  const avgPos = gscKeywords.length > 0 ? (gscKeywords.reduce((s: number, k: any) => s + k.position, 0) / gscKeywords.length).toFixed(1) : 'N/A';
  const quickWins = gscKeywords.filter((k: any) => k.position >= 4 && k.position <= 10 && k.ctr < 3);
  const totalSessions = ga4Data.filter((r: any) => r.metric_type === 'sessions').reduce((s: number, r: any) => s + r.value, 0);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 32px; }
  .logo { font-size: 28px; font-weight: 900; letter-spacing: -1.5px; margin-bottom: 4px; }
  .logo .l { color: #7c3aed; }
  .meta { font-size: 13px; color: #64748b; margin-bottom: 32px; }
  h2 { font-size: 16px; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; border-bottom: 1px solid #334155; padding-bottom: 6px; }
  .kpi-row { display: flex; gap: 16px; margin-bottom: 20px; }
  .kpi { flex: 1; background: #1e293b; border-radius: 10px; padding: 16px; border: 1px solid #334155; }
  .kpi-val { font-size: 24px; font-weight: 800; color: #f8fafc; margin-bottom: 4px; }
  .kpi-label { font-size: 12px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; border-bottom: 1px solid #334155; }
  td { padding: 9px 10px; border-bottom: 1px solid #1e293b; color: #e4e4e7; }
  .tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; display: inline-block; }
  .tag-top3 { background: rgba(34,197,94,.15); color: #22c55e; }
  .tag-win { background: rgba(124,58,237,.15); color: #a78bfa; }
  .tag-ctr { background: rgba(245,158,11,.15); color: #f59e0b; }
  .rec { background: rgba(124,58,237,.08); border: 1px solid rgba(124,58,237,.2); border-radius: 10px; padding: 16px; margin-bottom: 10px; }
  .rec-title { font-size: 14px; font-weight: 600; color: #f8fafc; margin-bottom: 4px; }
  .rec-sub { font-size: 13px; color: #71717a; }
  .footer { margin-top: 40px; font-size: 12px; color: #334155; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; }
</style>
</head>
<body>
  <div class="logo"><span class="l">L</span>umnix</div>
  <div class="meta">Marketing Intelligence Report &nbsp;·&nbsp; ${name} &nbsp;·&nbsp; ${date}</div>

  <h2>Overview</h2>
  <div class="kpi-row">
    <div class="kpi"><div class="kpi-val">${totalClicks.toLocaleString()}</div><div class="kpi-label">Organic Clicks</div></div>
    <div class="kpi"><div class="kpi-val">${totalImpressions.toLocaleString()}</div><div class="kpi-label">Impressions</div></div>
    <div class="kpi"><div class="kpi-val">#${avgPos}</div><div class="kpi-label">Avg Position</div></div>
    <div class="kpi"><div class="kpi-val">${totalSessions.toLocaleString()}</div><div class="kpi-label">GA4 Sessions</div></div>
  </div>

  <h2>AI Recommendations</h2>
  ${quickWins.length > 0 ? `<div class="rec"><div class="rec-title">⚡ ${quickWins.length} Quick Win Keywords</div><div class="rec-sub">Positions 4-10 with low CTR. Improve meta titles to capture more clicks.</div></div>` : ''}
  ${gscKeywords.filter((k: any) => k.position <= 3).length > 0 ? `<div class="rec"><div class="rec-title">🏆 ${gscKeywords.filter((k: any) => k.position <= 3).length} Keywords Ranking Top 3</div><div class="rec-sub">Protect these rankings with regular content updates and internal linking.</div></div>` : ''}
  ${totalSessions > 0 ? `<div class="rec"><div class="rec-title">📈 ${totalSessions.toLocaleString()} Sessions Tracked</div><div class="rec-sub">Review traffic sources in the Analytics dashboard to understand what's driving growth.</div></div>` : ''}

  <h2>Top Keywords</h2>
  <table>
    <tr><th>Keyword</th><th>Position</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>Signal</th></tr>
    ${gscKeywords.slice(0, 30).map((k: any) => {
      const sig = k.position <= 3 ? '<span class="tag tag-top3">Top 3</span>' : (k.position >= 4 && k.position <= 10 && k.ctr < 3) ? '<span class="tag tag-win">Quick Win</span>' : (k.impressions > 500 && k.ctr < 1) ? '<span class="tag tag-ctr">Low CTR</span>' : '';
      return `<tr><td>${k.query}</td><td>#${Math.round(k.position)}</td><td>${k.impressions?.toLocaleString()}</td><td>${k.clicks}</td><td>${k.ctr?.toFixed(1)}%</td><td>${sig}</td></tr>`;
    }).join('')}
  </table>

  <div class="footer">Generated by Lumnix · Oltaflock AI · lumnix-ai.vercel.app</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWin = window.open(url, '_blank');
  if (printWin) {
    printWin.onload = () => {
      setTimeout(() => { printWin.print(); }, 500);
    };
  }
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { workspace } = useWorkspace();
  const { data: gscResp, loading: gscLoading } = useGSCData(workspace?.id, 'keywords', 30);
  const { data: ga4Resp, loading: ga4Loading } = useGA4Data(workspace?.id, 'overview', 30);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const loading = gscLoading || ga4Loading;
  const gscKeywords = gscResp?.keywords || [];
  const ga4Data = ga4Resp?.data || [];
  const hasData = gscKeywords.length > 0 || ga4Data.length > 0;

  async function handleGenerate(type: string, format: 'csv' | 'pdf') {
    setGenerating(`${type}-${format}`);
    await new Promise(r => setTimeout(r, 800)); // slight delay for UX

    if (format === 'csv') {
      const result = generateCSV(type, gscKeywords, ga4Data, workspace);
      if (result) download(result.content, result.filename, result.mime);
    } else {
      generatePDF(type, gscKeywords, ga4Data, workspace);
    }

    setGenerated(prev => new Set([...prev, `${type}-${format}`]));
    setGenerating(null);
  }

  return (
    <PageShell title="Reports" description="Export your marketing data as CSV or PDF" icon={FileText}>
      {!hasData && !loading && (
        <div style={{ padding: 24, borderRadius: 12, backgroundColor: '#18181b', border: '1px solid #27272a', textAlign: 'center', marginBottom: 24 }}>
          <FileText size={28} color="#334155" style={{ marginBottom: 10 }} />
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 8 }}>Connect and sync GSC or GA4 to generate reports with real data</p>
          <a href="/dashboard/settings" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none', fontWeight: 500 }}>Go to Settings →</a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {reportTypes.map(rt => {
          const Icon = rt.icon;
          return (
            <div key={rt.id} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${rt.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={rt.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5' }}>{rt.label}</h3>
                  <p style={{ fontSize: 12, color: '#52525b', marginTop: 2 }}>{rt.desc}</p>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                {rt.sections.map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '1px solid #1e1e22', fontSize: 12, color: '#71717a' }}>
                    <CheckCircle2 size={12} color="#334155" />
                    {s}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleGenerate(rt.id, 'csv')}
                  disabled={!!generating || loading || !hasData}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px', borderRadius: 8, border: '1px solid #334155',
                    backgroundColor: '#27272a', color: '#a1a1aa', fontSize: 13, fontWeight: 600,
                    cursor: (!generating && !loading && hasData) ? 'pointer' : 'not-allowed',
                    opacity: (!hasData || loading) ? 0.5 : 1,
                  }}
                >
                  {generating === `${rt.id}-csv` ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : generated.has(`${rt.id}-csv`) ? <CheckCircle2 size={14} color="#22c55e" /> : <Download size={14} />}
                  CSV
                </button>
                <button
                  onClick={() => handleGenerate(rt.id, 'pdf')}
                  disabled={!!generating || loading || !hasData}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px', borderRadius: 8, border: 'none',
                    backgroundColor: rt.color, color: 'white', fontSize: 13, fontWeight: 600,
                    cursor: (!generating && !loading && hasData) ? 'pointer' : 'not-allowed',
                    opacity: (!hasData || loading) ? 0.5 : 1,
                  }}
                >
                  {generating === `${rt.id}-pdf` ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : generated.has(`${rt.id}-pdf`) ? <CheckCircle2 size={14} /> : <FileDown size={14} />}
                  PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last generated */}
      {generated.size > 0 && (
        <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 13, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={14} />
          {generated.size} report{generated.size > 1 ? 's' : ''} generated — check your downloads folder
        </div>
      )}
    </PageShell>
  );
}
