"use client";
import { useEffect, useState, useRef } from "react";

export default function WsPage() {
  const [state, setState] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${location.host}/api/socket`;
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => console.log("WebSocket 開啟");
    wsRef.current.onmessage = (e) => {
      const { state } = JSON.parse(e.data);
      setState(state);
    };
    wsRef.current.onclose = () => console.log("WebSocket 關閉");

    return () => wsRef.current?.close();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">按鈕狀態（WebSocket）</h1>
      <p className="text-lg">
        {state === 1 ? "✅ 已按下" : state === 0 ? "❌ 已放開" : "等待狀態..."}
      </p>
    </main>
  );
}
