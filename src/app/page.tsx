"use client";
import { useEffect, useState, useRef } from "react";

/**
 * 如果需要在生產環境與本地端切換 WS URL，可使用環境變數:
 *  - 在 .env.local 設置 NEXT_PUBLIC_WS_URL=wss://hackthon-nextjs.vercel.app/api/socket
 *  - 在本地開發時可省略，此時會 fallback 為當前 location.host
 */
const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  `${location.protocol === "https:" ? "wss" : "ws"}://${
    location.host
  }/api/socket`;

export default function HomePage() {
  const [state, setState] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(WS_URL);
    wsRef.current.onopen = () => console.log("WS open:", WS_URL);
    wsRef.current.onmessage = (e) => {
      try {
        setState(JSON.parse(e.data).state);
      } catch {
        console.error("Invalid WS message:", e.data);
      }
    };
    wsRef.current.onclose = () => console.log("WS close");

    return () => wsRef.current?.close();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">按鈕狀態</h1>
      <p className="text-lg">
        {state === 1 ? "✅ 按下" : state === 0 ? "❌ 放開" : "等待中..."}
      </p>
    </main>
  );
}
