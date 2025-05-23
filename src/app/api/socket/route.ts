// app/api/socket/route.ts
import type { WebSocket, WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import { initWebSocketServer } from '@/lib/ws';

export const runtime = 'nodejs';

/**
 * 由 next-ws 注入的 WebSocket 處理函式
 */
export function SOCKET(
  client: WebSocket,
  request: IncomingMessage,
  server: WebSocketServer
) {
  initWebSocketServer(server);
  console.log('>>> WS client connected');
  client.on('close', () => console.log('>>> WS client disconnected'));
}