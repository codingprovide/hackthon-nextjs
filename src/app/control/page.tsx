"use client";

import useSWR from "swr";
import { useState } from "react";

const steps = [
  "ship_arrival",
  "unloading_start",
  "truck_entry",
  "gate_open",
  "truck_exit",
] as const;
type ProcessStep = (typeof steps)[number];

interface StatePayload {
  currentStep: ProcessStep;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json() as Promise<StatePayload>);

export default function ControlPage() {
  const { data, mutate } = useSWR<StatePayload>("/api/state", fetcher);
  const [loading, setLoading] = useState(false);

  if (!data) return <p>載入中...</p>;

  const idx = steps.indexOf(data.currentStep);

  async function updateStep(step: ProcessStep) {
    setLoading(true);
    await fetch("/api/state/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step }),
    });
    await mutate();
    setLoading(false);
  }

  return (
    <div className="flex justify-center space-x-4 mt-8">
      <button
        onClick={() => idx > 0 && updateStep(steps[idx - 1])}
        disabled={idx === 0 || loading}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
      >
        上一步
      </button>
      <button
        onClick={() => updateStep(steps[0])}
        disabled={loading}
        className="px-4 py-2 bg-red-200 text-red-700 rounded-lg hover:bg-red-300 disabled:opacity-50"
      >
        初始
      </button>
      <button
        onClick={() => idx < steps.length - 1 && updateStep(steps[idx + 1])}
        disabled={idx === steps.length - 1 || loading}
        className="px-4 py-2 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-300 disabled:opacity-50"
      >
        下一步
      </button>
    </div>
  );
}
