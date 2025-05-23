// app/api/socket/route.ts
import type { WebSocket, WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';

/// <reference lib="webworker" />
export const runtime = 'node';  // next-ws 需在 node 環境下運行

let wsServer: WebSocketServer | null = null;

// next-ws 會呼叫此函式來處理每個連線
export function SOCKET(
  client: WebSocket,
  request: IncomingMessage,
  server: WebSocketServer
) {
  wsServer = server;
  console.log('>>> WebSocket 客戶端已連線');

  client.on('close', () => {
    console.log('>>> WebSocket 客戶端已斷開');
  });
}

// 推播函式，供其他 API 使用
export function broadcast(data: unknown) {
  if (!wsServer) return;
  const payload = JSON.stringify(data);
  for (const socket of wsServer.clients) {
    // @ts-ignore readyState
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  }
}