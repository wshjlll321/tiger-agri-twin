import { NextRequest, NextResponse } from 'next/server';
import { AgriBrain } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const { zoneId } = await req.json();

    if (!zoneId || typeof zoneId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "zoneId" field' },
        { status: 400 }
      );
    }

    const result = await AgriBrain.generateWeeklyReport(zoneId);

    return NextResponse.json({
      success: true,
      report: result.report,
      requestId: result.requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('AI Report Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}
