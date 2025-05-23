"use client";
import { useEffect, useState, useRef } from "react";

export default function HomePage() {
  const [state, setState] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    wsRef.current = new WebSocket(`${protocol}://${location.host}/api/socket`);
    wsRef.current.onmessage = (e) => setState(JSON.parse(e.data).state);
    wsRef.current.onopen = () => console.log("WS open");
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
