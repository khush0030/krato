import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

// GET /api/workspace — get current user's workspace
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

    const { data: membership } = await admin
      .from('workspace_members')
      .select('workspace_id, role, workspaces(id, name, plan)')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!membership) {
      const { data: workspace } = await admin
        .from('workspaces')
        .insert({ name: `${user.user_metadata?.full_name || 'My'}'s Workspace`, created_by: user.id })
        .select()
        .single();

      if (workspace) {
        await admin.from('workspace_members').insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner',
        });
        return NextResponse.json({ workspace, role: 'owner' });
      }
    }

    return NextResponse.json({
      workspace: membership?.workspaces,
      role: membership?.role,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
