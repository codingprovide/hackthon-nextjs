// app/api/events/route.ts
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Readable } from 'stream';

export const runtime = 'nodejs';   // ← 一定要指定用 Node.js，才能用 res.write()

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // 建立一個可推送的 Readable stream
  const stream = new Readable({
    read() {}   // no-op
  });

  // 一開始推一個空行，確保 SSE 規範
  stream.push('\n');

  // 用來記錄上次已經推過的狀態
  let lastStep: string | null = null;
  let lastEventTime = new Date(0);

  // 定義輪詢函式
  const poll = async () => {
    try {
      // 1) 拿到最新的 currentStep
      const state = await prisma.processState.findUnique({
        where: { id: 1 },
        select: { currentStep: true },
      });

      // 2) 拿到 timestamp > lastEventTime 的新事件
      const events = await prisma.event.findMany({
        where: { timestamp: { gt: lastEventTime } },
        orderBy: { timestamp: 'asc' },
      });

      // 準備 payload
      const payload: any = {};
      let changed = false;

      if (state && state.currentStep !== lastStep) {
        payload.currentStep = state.currentStep;
        lastStep = state.currentStep;
        changed = true;
      }

      if (events.length > 0) {
        payload.events = events.map((e) => ({
          id: e.id,
          message: e.message,
          timestamp: e.timestamp.toISOString(),
        }));
        lastEventTime = events[events.length - 1].timestamp;
        changed = true;
      }

      // 如果真的有變化，才寫入 stream
      if (changed) {
        stream.push(`data: ${JSON.stringify(payload)}\n\n`);
      }
    } catch (err) {
      console.error('SSE 輪詢錯誤', err);
      // 你可以選擇推一個 error event：
      // stream.push(`event: error\ndata: ${(err as Error).message}\n\n`);
    }

    // 如果連線還沒關，1 秒後再輪一次
    if (!stream.destroyed) {
      setTimeout(poll, 1000);
    }
  };

  // 開始第一次輪詢
  poll();

  // 當前端關閉連線時，Node.js 端也要關掉 stream & Prisma
  req.signal.addEventListener('abort', () => {
    stream.push(null);
    prisma.$disconnect();
  });

  // 回傳 Readable stream，並設定 SSE 必要的 headers
  return new Response(stream as any, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
