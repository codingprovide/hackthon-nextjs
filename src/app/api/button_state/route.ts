// app/api/button_state/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { broadcast } from '@/lib/ws';

let currentState = -1;

export async function POST(request: NextRequest) {
  const data = await request.json();
  const stateParam = data.Sensor_1;
  let message: string;

  if (stateParam !== undefined && stateParam !== null) {
    const parsed = Number(stateParam);
    if (Number.isInteger(parsed)) {
      currentState = parsed;
      broadcast({ state: currentState });
      message = parsed === 1 ? 'Pressed' : 'Released';
      console.log(`>>> ${message} <<<`);
    } else {
      message = 'Invalid state';
      console.warn(`>>> Non-integer: ${stateParam} <<<`);
    }
  } else {
    message = `Current: ${currentState}`;
  }

  return NextResponse.json({ success: true, state: currentState, message });
}
