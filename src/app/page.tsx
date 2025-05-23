// app/page.tsx
"use client";

import useSWR from "swr";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Box, Truck, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  "ship_arrival",
  "unloading_start",
  "truck_entry",
  "gate_open",
  "truck_exit",
] as const;
type ProcessStep = (typeof steps)[number];

interface EventEntry {
  id: number;
  message: string;
  timestamp: string;
}

interface StatePayload {
  currentStep: ProcessStep;
  events: EventEntry[];
}

interface SSEPayload {
  currentStep?: ProcessStep;
  events?: EventEntry[];
  Sensor_1?: number;
  Sensor_2?: number;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
    return res.json() as Promise<StatePayload>;
  });

const stepIcons: Record<ProcessStep, React.FC<any>> = {
  ship_arrival: Ship,
  unloading_start: Box,
  truck_entry: Truck,
  gate_open: Clock,
  truck_exit: ArrowRight,
};

const stepLabels: Record<ProcessStep, string> = {
  ship_arrival: "貨櫃船進港",
  unloading_start: "裝卸開始",
  truck_entry: "卡車進場卸貨",
  gate_open: "閘門開啟",
  truck_exit: "卡車離場",
};

export default function HomePage() {
  const { data, error } = useSWR<StatePayload>("/api/state", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false, // only fetch once on mount
  });

  const [events, setEvents] = useState<EventEntry[]>([]);
  const [currentStep, setCurrentStep] = useState<ProcessStep | null>(null);
  const initialLoaded = useRef(false);
  const esRef = useRef<EventSource | null>(null);

  // 用來記錄所有已渲染過的事件 key，避免重複
  const seenKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!data || initialLoaded.current) return;

    // 1) 初始化 state 並標記已見過的 events
    setEvents(data.events);
    data.events.forEach((evt) => {
      seenKeys.current.add(`${evt.id}-${evt.timestamp}`);
    });
    setCurrentStep(data.currentStep);
    initialLoaded.current = true;

    // 2) 訂閱 SSE
    const es = new EventSource("/api/events");
    es.onopen = () => console.log("SSE 已連線");
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data) as SSEPayload;

        // 更新 currentStep
        if (payload.currentStep) {
          setCurrentStep(payload.currentStep);
        }

        // 處理後端 events
        if (payload.events) {
          setEvents((prev) => {
            const toAdd = payload.events!.filter((evt) => {
              const key = `${evt.id}-${evt.timestamp}`;
              if (seenKeys.current.has(key)) {
                return false;
              }
              seenKeys.current.add(key);
              return true;
            });
            return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
          });
        }

        // 處理 Sensor_1 / Sensor_2 產生的事件
        const now = new Date().toISOString();
        const sensorHits: EventEntry[] = [];

        if (payload.Sensor_1 === 1) {
          const evt: EventEntry = {
            id: Date.now() + Math.random(),
            message: "感測器 Sensor_1 觸發",
            timestamp: now,
          };
          const key = `${evt.id}-${evt.timestamp}`;
          if (!seenKeys.current.has(key)) {
            seenKeys.current.add(key);
            sensorHits.push(evt);
          }
        }
        if (payload.Sensor_2 === 1) {
          const evt: EventEntry = {
            id: Date.now() + Math.random(),
            message: "感測器 Sensor_2 觸發",
            timestamp: now,
          };
          const key = `${evt.id}-${evt.timestamp}`;
          if (!seenKeys.current.has(key)) {
            seenKeys.current.add(key);
            sensorHits.push(evt);
          }
        }
        if (sensorHits.length) {
          setEvents((prev) => [...prev, ...sensorHits]);
        }
      } catch (err) {
        console.error("SSE 資料解析錯誤:", err);
      }
    };
    es.onerror = (e) => {
      console.warn("SSE 連線錯誤，將自動重試", e);
    };

    esRef.current = es;
    return () => {
      esRef.current?.close();
    };
  }, [data]);

  if (error) return <p className="text-red-600">載入失敗：{error.message}</p>;
  if (!data || currentStep === null) return <p>載入中...</p>;

  return (
    <main className="p-4 space-y-6">
      {/* 流程進度 */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>流程進度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const curIdx = steps.indexOf(currentStep!);
              const status =
                idx < curIdx
                  ? "completed"
                  : idx === curIdx
                  ? "current"
                  : "upcoming";
              const Icon = stepIcons[step];
              return (
                <div
                  key={step}
                  className={cn(
                    "flex items-center p-2 rounded-lg",
                    status === "completed" && "bg-green-100 text-green-600",
                    status === "current" && "bg-yellow-100 text-yellow-600",
                    status === "upcoming" && "bg-gray-100 text-gray-400"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{stepLabels[step]}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 實時事件 */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>實時事件</CardTitle>
        </CardHeader>
        <CardContent className="max-h-60 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-center text-gray-500">暫無事件</p>
          ) : (
            events.map((evt) => (
              <div
                key={`${evt.id}-${evt.timestamp}`}
                className="flex justify-between py-1 border-b"
              >
                <span>{evt.message}</span>
                <span className="text-xs text-gray-500">
                  {new Date(evt.timestamp).toLocaleTimeString("zh-TW", {
                    hour12: false,
                  })}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
