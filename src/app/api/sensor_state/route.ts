// app/api/events/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';    // 确保在 Node.js 环境下运行

// 全局保存所有连线的 writer
const clients = new Set<WritableStreamDefaultWriter>();

export async function GET(_req: NextRequest) {
  // 建一个可写入的流
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  clients.add(writer);

  // 心跳：每 15 秒发空 comment (= 保活)，避免 proxy 超时
  const timer = setInterval(() => {
    writer.write(`: keep-alive\n\n`);
  }, 15_000);

  // 客户端断开时清理
  _req.signal.addEventListener('abort', () => {
    clearInterval(timer);
    clients.delete(writer);
    writer.close();
  });

  return new NextResponse(stream.readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// app/api/events/route.ts
export async function POST(req: NextRequest) {
    let payload = { Sensor_1: -1, Sensor_2: -1 };
    try {
      const body = await req.json();              // 直接拿到 {Sensor_1:0, Sensor_2:0}
      payload = {
        Sensor_1: Number(body.Sensor_1),
        Sensor_2: Number(body.Sensor_2),
      };
    } catch (e) {
      console.error('Parse error', e);
    }
  
    // 用 SSE 標準格式推送整個物件
    const msg = `data: ${JSON.stringify(payload)}\n\n`;
    for (const w of clients) {
      w.write(msg);
    }
  
    return NextResponse.json({ success: true, ...payload });
  }
  