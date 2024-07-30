import { create } from "zustand";

type TableViewStore = {
  view: "STUDENT" | "ATTENDANCE";
  changeView: (view: "STUDENT" | "ATTENDANCE") => void;
};

export const useTableViewStore = create<TableViewStore>()((set) => ({
  view: "STUDENT",
  changeView: (view: "STUDENT" | "ATTENDANCE") => set({ view }),
}));
