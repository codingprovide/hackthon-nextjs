"use client";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [state, setState] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 只在瀏覽器組裝 URL
    const url =
      process.env.NEXT_PUBLIC_WS_URL ||
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${
        window.location.host
      }/api/socket`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => console.log("WS open:", url);
    ws.onmessage = (e) => {
      try {
        setState(JSON.parse(e.data).state);
      } catch {
        console.error("Invalid WS message:", e.data);
      }
    };
    ws.onclose = () => console.log("WS close");

    return () => ws.close();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">按鈕狀態</h1>
      <p className="text-lg">
        {state === 1 ? "✅ 按下" : state === 0 ? "❌ 放開" : "等待中…"}
      </p>
    </main>
  );
}
