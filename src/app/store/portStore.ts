import { create } from "zustand";

export type ProcessStep =
  | "ship_arrival"
  | "unloading_start"
  | "truck_entry"
  | "gate_open"
  | "truck_exit";

interface ProcessState {
  currentStep: ProcessStep;
  events: { id: string; message: string; timestamp: string }[];
  setStep: (step: ProcessStep) => void;
  pushEvent: (message: string) => void;
  next: (steps: ProcessStep[]) => void;
  prev: (steps: ProcessStep[]) => void;
  reset: (steps: ProcessStep[]) => void;
}

export const useProcessStore = create<ProcessState>((set, get) => ({
  currentStep: "ship_arrival",
  events: [],
  setStep: (step) => set({ currentStep: step }),
  pushEvent: (message) => {
    const ts = new Date().toLocaleTimeString("zh-TW", { hour12: false });
    set((state) => ({
      events: [
        { id: Date.now().toString(), message, timestamp: ts },
        ...state.events,
      ],
    }));
  },
  next: (steps) => {
    const { currentStep, pushEvent, setStep } = get();
    const idx = steps.indexOf(currentStep);
    if (idx < steps.length - 1) {
      const nextStep = steps[idx + 1];
      setStep(nextStep);
      pushEvent(`進入下一步 - ${nextStep}`);
    }
  },
  prev: (steps) => {
    const { currentStep, setStep } = get();
    const idx = steps.indexOf(currentStep);
    if (idx > 0) {
      setStep(steps[idx - 1]);
    }
  },
  reset: (steps) => {
    set({ currentStep: steps[0], events: [] });
  },
}));
