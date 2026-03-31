import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// POST /api/integrations/disconnect — remove an integration and its tokens
export async function POST(req: NextRequest) {
  try {
    const { integration_id } = await req.json();
    if (!integration_id) {
      return NextResponse.json({ error: 'integration_id required' }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    // Delete OAuth tokens
    await db.from('oauth_tokens').delete().eq('integration_id', integration_id);

    // Delete the integration
    const { error } = await db.from('integrations').delete().eq('id', integration_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
