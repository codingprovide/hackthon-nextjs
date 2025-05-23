// lib/ws.ts
import type { WebSocketServer } from 'ws';

let wsServer: WebSocketServer | null = null;

/**
 * 初始化 WebSocketServer 實例
 */
export function initWebSocketServer(server: WebSocketServer) {
  wsServer = server;
}

/**
 * 廣播資料給所有已連線的客戶端
 */
export function broadcast(data: unknown) {
  if (!wsServer) return;
  const payload = JSON.stringify(data);
  for (const socket of wsServer.clients) {
    // @ts-ignore readyState
    if (socket.readyState === WebSocketServer.OPEN) socket.send(payload);
  }
}