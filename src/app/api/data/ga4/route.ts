import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/data/ga4?workspace_id=...&days=30&type=overview|sources|pages|conversions
export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.nextUrl.searchParams.get('workspace_id');
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30');
    const type = req.nextUrl.searchParams.get('type') || 'overview';

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspace_id' }, { status: 400 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: rawData } = await getSupabaseAdmin()
      .from('ga4_data')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('date', startDateStr);

    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ data: [], message: 'No data yet. Sync your GA4 integration first.' });
    }

    if (type === 'overview') {
      // Daily sessions, users, pageviews
      const dailyMap = new Map<string, { sessions: number; users: number; pageviews: number }>();
      for (const row of rawData) {
        if (row.dimension_name !== 'total' && row.dimension_name !== 'date') continue;
        const existing = dailyMap.get(row.date) || { sessions: 0, users: 0, pageviews: 0 };
        if (row.metric_type === 'sessions') existing.sessions += row.value;
        if (row.metric_type === 'totalUsers') existing.users += row.value;
        if (row.metric_type === 'screenPageViews') existing.pageviews += row.value;
        dailyMap.set(row.date, existing);
      }

      const overview = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return NextResponse.json({ data: overview });
    }

    if (type === 'sources') {
      // Traffic sources aggregated
      const sourceMap = new Map<string, { sessions: number; users: number }>();
      for (const row of rawData) {
        if (row.dimension_name !== 'sessionSource' && row.dimension_name !== 'sessionMedium') continue;
        const key = row.dimension_value;
        const existing = sourceMap.get(key) || { sessions: 0, users: 0 };
        if (row.metric_type === 'sessions') existing.sessions += row.value;
        if (row.metric_type === 'totalUsers') existing.users += row.value;
        sourceMap.set(key, existing);
      }

      const sources = Array.from(sourceMap.entries())
        .map(([source, data]) => ({ source, ...data }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 20);

      return NextResponse.json({ data: sources });
    }

    if (type === 'pages') {
      const pageMap = new Map<string, { pageviews: number; bounceRate: number; count: number }>();
      for (const row of rawData) {
        if (row.dimension_name !== 'pagePath') continue;
        const existing = pageMap.get(row.dimension_value) || { pageviews: 0, bounceRate: 0, count: 0 };
        if (row.metric_type === 'screenPageViews') existing.pageviews += row.value;
        if (row.metric_type === 'bounceRate') { existing.bounceRate += row.value; existing.count++; }
        pageMap.set(row.dimension_value, existing);
      }

      const pages = Array.from(pageMap.entries())
        .map(([page, data]) => ({ page, pageviews: data.pageviews, bounceRate: data.count > 0 ? Math.round(data.bounceRate / data.count * 100) / 100 : 0 }))
        .sort((a, b) => b.pageviews - a.pageviews)
        .slice(0, 20);

      return NextResponse.json({ data: pages });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
