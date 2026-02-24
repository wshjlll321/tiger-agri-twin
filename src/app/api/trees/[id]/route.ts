import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tree = {
    id,
    code: id,
    lat: 9.1234,
    lng: 99.3456,
    age: 5,
    height: 12.5,
    crownDiameter: 4.2,
    healthStatus: 'HEALTHY',
    carbonStock: 45.2,
    lastInspection: '2026-02-10',
    diseaseHistory: [
      {
        date: '2025-11-15',
        disease: 'Oidium heveae',
        severity: 'mild',
        treated: true,
      },
    ],
  };

  return NextResponse.json(tree);
}
