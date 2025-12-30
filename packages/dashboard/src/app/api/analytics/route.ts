import { NextRequest, NextResponse } from 'next/server';
import { getHourlyStats, getModelStats, getTopAgents, getDashboardStats } from '@/lib/db/analytics';
import { initializeSchema } from '@/lib/db';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    try {
      await initializeSchema();
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'day') as 'day' | 'week' | 'month';
    const hours = parseInt(searchParams.get('hours') || '24');

    const [hourlyStats, modelStats, topAgents, dashboardStats] = await Promise.all([
      getHourlyStats(hours),
      getModelStats(period),
      getTopAgents(10, period),
      getDashboardStats(),
    ]);

    return NextResponse.json({
      hourly: hourlyStats,
      models: modelStats,
      topAgents,
      dashboard: dashboardStats,
      period,
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
