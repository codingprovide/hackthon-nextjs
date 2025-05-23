// app/api/button_state/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { broadcast } from '../socket/route';  // 引入 next-ws 實現的 broadcast

let currentState = -1;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const stateParam = url.searchParams.get('state');
  let message: string;

  if (stateParam !== null) {
    const parsed = Number(stateParam);
    if (Number.isInteger(parsed)) {
      currentState = parsed;
      // 使用 next-ws 提供的 broadcast
      broadcast({ state: currentState });

      message = parsed === 1
        ? 'Physical Button Pressed!'
        : parsed === 0
          ? 'Physical Button Released!'
          : `Invalid button state: ${stateParam}`;

      console.log(`>>> ${message} <<<`);
    } else {
      message = `Non-integer button state: ${stateParam}`;
      console.warn(`>>> ${message} <<<`);
    }
  } else {
    message = `Current button state: ${currentState}`;
  }

  return NextResponse.json({ success: true, state: currentState, message });
}