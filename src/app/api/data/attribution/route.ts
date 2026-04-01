import { NextResponse } from 'next/server';

// Attribution is not yet implemented — return empty state
export async function GET() {
  return NextResponse.json({
    model: 'last_touch',
    breakdown: [],
    totalValue: 0,
    totalConversions: 0,
    dataPoints: 0,
    message: 'Attribution modeling coming soon.',
  });
}
