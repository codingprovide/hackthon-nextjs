"use client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [s1, setS1] = useState<number | null>(null);
  const [s2, setS2] = useState<number | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/sensor_state");
    es.onmessage = (e) => {
      // e.data = '{"Sensor_1":0,"Sensor_2":0}'
      const data = JSON.parse(e.data) as { Sensor_1: number; Sensor_2: number };
      setS1(data.Sensor_1);
      setS2(data.Sensor_2);
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">按鈕／感測器狀態</h1>
      <p className="text-lg">
        Sensor 1: {s1 === 1 ? "✅ 按下" : s1 === 0 ? "❌ 放開" : "…等待中"}
      </p>
      <p className="text-lg">
        Sensor 2: {s2 === 1 ? "✅ 按下" : s2 === 0 ? "❌ 放開" : "…等待中"}
      </p>
    </main>
  );
}
