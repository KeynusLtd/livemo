import { create } from "zustand";
import { persist } from "zustand/middleware";

type FarmState = {
  activeFarmId: number | null;
  setActiveFarmId: (farmId: number | null) => void;
};

export const useFarmStore = create<FarmState>()(
  persist(
    (set) => ({
      activeFarmId: null,
      setActiveFarmId: (farmId) => set({ activeFarmId: farmId }),
    }),
    {
      name: "livemo_farmer_active_farm",
      partialize: (state) => ({ activeFarmId: state.activeFarmId }),
    }
  )
);
