import WebSocket, { WebSocketServer } from 'ws';

/**
 * 擴充 WebSocket，加入 isAlive 屬性以進行心跳檢查
 */
interface ExtendedSocket extends WebSocket {
  isAlive: boolean;
}

let wsServer: WebSocketServer | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

/**
 * 初始化 WebSocketServer 與心跳機制
 *
 * @param server - 已建立的 WebSocketServer 實例
 */
export function initWebSocketServer(server: WebSocketServer) {
  wsServer = server;

  // 新連線時設定初始狀態與 pong 監聽
  wsServer.on('connection', (socket: WebSocket) => {
    const extSocket = socket as ExtendedSocket;
    extSocket.isAlive = true;

    extSocket.on('pong', () => {
      extSocket.isAlive = true;
    });
  });

  // 啟動心跳檢查：每 30 秒 ping 一次
  heartbeatInterval = setInterval(() => {
    if (!wsServer) {
      clearInterval(heartbeatInterval!);
      return;
    }

    wsServer.clients.forEach((client) => {
      const socket = client as ExtendedSocket;

      // 若前一次沒回應 pong，就強制關閉
      if (!socket.isAlive) {
        return socket.terminate();
      }

      socket.isAlive = false;
      socket.ping();
    });
  }, 30_000);
}

/**
 * 廣播訊息給所有連線中的客戶端
 *
 * @param data - 要廣播的資料，會自動 JSON 序列化
 */
export function broadcast(data: unknown) {
  if (!wsServer) return;
  const payload = JSON.stringify(data);

  wsServer.clients.forEach((client) => {
    const socket = client as ExtendedSocket;
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  });
}

/**
 * 關閉 WebSocketServer 及心跳機制（可選）
 */
export function closeWebSocketServer() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  if (wsServer) {
    wsServer.close();
    wsServer = null;
  }
}
