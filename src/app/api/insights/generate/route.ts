import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const { workspace_id } = await req.json();
    if (!workspace_id) {
      return NextResponse.json({ error: 'workspace_id required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const db = getSupabaseAdmin();

    // Fetch workspace data in parallel
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [integrationsRes, ga4Res, gscRes] = await Promise.allSettled([
      db.from('integrations').select('provider, status, last_sync_at').eq('workspace_id', workspace_id),
      db.from('ga4_data')
        .select('metric_type, dimension_name, dimension_value, value, date')
        .eq('workspace_id', workspace_id)
        .gte('date', thirtyDaysAgo)
        .order('value', { ascending: false })
        .limit(200),
      db.from('gsc_data')
        .select('query, clicks, impressions, position, page, date')
        .eq('workspace_id', workspace_id)
        .gte('date', thirtyDaysAgo)
        .order('clicks', { ascending: false })
        .limit(100),
    ]);

    const integrations = integrationsRes.status === 'fulfilled' ? (integrationsRes.value.data || []) : [];
    const ga4Rows = ga4Res.status === 'fulfilled' ? (ga4Res.value.data || []) : [];
    const gscRows = gscRes.status === 'fulfilled' ? (gscRes.value.data || []) : [];

    const connected = integrations.filter((i: any) => i.status === 'connected').map((i: any) => i.provider);
    const hasData = ga4Rows.length > 0 || gscRows.length > 0;

    let prompt: string;

    if (!hasData) {
      prompt = `You are Lumnix AI, a marketing analytics assistant. The user has no marketing data connected yet.
Connected integrations: ${connected.length > 0 ? connected.join(', ') : 'none'}

Generate exactly 3 helpful setup tips as JSON. Each tip should guide them to connect data sources and get value from the platform.

Return ONLY a JSON array (no markdown, no code fences) of objects with these fields:
- type: "tip"
- title: string (short, actionable)
- description: string (1-2 sentences explaining why and how)
- priority: "high" | "medium" | "low"
- action: string (specific next step)`;
    } else {
      // Build data summary for the prompt
      const sessionRows = ga4Rows.filter((r: any) => r.metric_type === 'sessions');
      const totalSessions = sessionRows.reduce((s: number, r: any) => s + (r.value || 0), 0);
      const userRows = ga4Rows.filter((r: any) => r.metric_type === 'totalUsers');
      const totalUsers = userRows.reduce((s: number, r: any) => s + (r.value || 0), 0);
      const bounceRows = ga4Rows.filter((r: any) => r.metric_type === 'bounceRate');
      const avgBounce = bounceRows.length > 0
        ? (bounceRows.reduce((s: number, r: any) => s + (r.value || 0), 0) / bounceRows.length).toFixed(1)
        : null;

      const topSources = ga4Rows
        .filter((r: any) => r.metric_type === 'sessions' && r.dimension_name === 'sessionSource')
        .reduce((acc: Record<string, number>, r: any) => {
          acc[r.dimension_value] = (acc[r.dimension_value] || 0) + r.value;
          return acc;
        }, {});

      const topPages = ga4Rows
        .filter((r: any) => r.dimension_name === 'pagePath')
        .reduce((acc: Record<string, number>, r: any) => {
          acc[r.dimension_value] = (acc[r.dimension_value] || 0) + r.value;
          return acc;
        }, {});

      // Aggregate GSC keywords
      const keywordMap: Record<string, { clicks: number; impressions: number; positions: number[] }> = {};
      for (const r of gscRows) {
        if (!keywordMap[r.query]) keywordMap[r.query] = { clicks: 0, impressions: 0, positions: [] };
        keywordMap[r.query].clicks += r.clicks || 0;
        keywordMap[r.query].impressions += r.impressions || 0;
        if (r.position) keywordMap[r.query].positions.push(r.position);
      }
      const keywords = Object.entries(keywordMap).map(([query, d]) => ({
        query,
        clicks: d.clicks,
        impressions: d.impressions,
        avgPosition: d.positions.length > 0
          ? Math.round(d.positions.reduce((a, b) => a + b, 0) / d.positions.length * 10) / 10
          : null,
      })).sort((a, b) => b.clicks - a.clicks);

      const nearPageOne = keywords.filter(k => k.avgPosition && k.avgPosition >= 4 && k.avgPosition <= 10);

      prompt = `You are Lumnix AI, a marketing analytics assistant. Analyze this real marketing data from the last 30 days and generate exactly 6 insights.

DATA:
- Connected: ${connected.join(', ')}
- GA4: ${totalSessions} sessions, ${totalUsers} users${avgBounce ? `, ${avgBounce}% avg bounce rate` : ''}
- Top traffic sources: ${JSON.stringify(Object.entries(topSources).slice(0, 5))}
- Top pages: ${JSON.stringify(Object.entries(topPages).slice(0, 5))}
- GSC: ${keywords.length} keywords tracked
- Top keywords by clicks: ${JSON.stringify(keywords.slice(0, 10))}
- Keywords ranking #4-10 (near page 1): ${JSON.stringify(nearPageOne.slice(0, 5))}

Generate exactly 6 insights with a good mix of types. Be specific — reference actual numbers, keyword names, and pages from the data.

Return ONLY a JSON array (no markdown, no code fences) of objects with these fields:
- type: "win" | "warning" | "opportunity" | "tip"
- title: string (short, specific, e.g. "Organic traffic up 23%")
- description: string (2-3 sentences with specific data points)
- metric: string | null (key number, e.g. "1,476 sessions")
- change: string | null (e.g. "+23%", "-5%")
- action: string | null (specific actionable next step)
- priority: "high" | "medium" | "low"`;
    }

    // Call GPT-4o-mini
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.json();
      return NextResponse.json({ error: err?.error?.message || 'OpenAI error' }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || '[]';

    // Parse JSON — strip markdown fences if present
    let insights: any[];
    try {
      const cleaned = rawContent.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
      insights = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Delete old insights for this workspace, then insert new ones
    await db.from('ai_insights').delete().eq('workspace_id', workspace_id);

    const rows = insights.map((ins: any) => ({
      workspace_id,
      type: ins.type,
      title: ins.title,
      description: ins.description,
      metric: ins.metric || null,
      change: ins.change || null,
      action: ins.action || null,
      priority: ins.priority || 'medium',
    }));

    const { data: saved, error: insertErr } = await db.from('ai_insights').insert(rows).select();
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ insights: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
