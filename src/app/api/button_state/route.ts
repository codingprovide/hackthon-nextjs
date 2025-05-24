// app/api/events/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const clients = new Set<WritableStreamDefaultWriter>();

export async function GET(req: NextRequest) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  clients.add(writer);

  // 送一次完整的初始狀態（可選）
  // writer.write(`data: ${JSON.stringify({ currentStep: "ship_arrival", events: [] })}\n\n`);

  // 心跳保活
  const timer = setInterval(() => {
    writer.write(`: keep-alive\n\n`);
  }, 15_000);

  req.signal.addEventListener('abort', () => {
    clearInterval(timer);
    clients.delete(writer);
    writer.close();
  });

  return new NextResponse(stream.readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(req: NextRequest) {
  let payload = { Sensor_1: -1, Sensor_2: -1 };
  try {
    const body = await req.json();
    payload = {
      Sensor_1: Number(body.Sensor_1),
      Sensor_2: Number(body.Sensor_2),
    };
  } catch (e) {
    console.error('Parse error', e);
  }

  const msg = `data: ${JSON.stringify(payload)}\n\n`;
  for (const w of clients) {
    w.write(msg);
  }

  return NextResponse.json({ success: true, ...payload });
}
