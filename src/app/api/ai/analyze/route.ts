import { NextRequest, NextResponse } from 'next/server';
import { AgriBrain } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "imageUrl" field' },
        { status: 400 }
      );
    }

    const result = await AgriBrain.analyzeTreeHealth(imageUrl);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('AI Analyze Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}
