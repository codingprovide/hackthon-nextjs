// app/api/health/route.ts
import { NextResponse } from 'next/server';
export async function GET() {
  return new NextResponse('OK');
}