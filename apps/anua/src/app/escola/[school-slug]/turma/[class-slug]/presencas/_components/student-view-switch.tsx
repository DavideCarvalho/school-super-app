"use client";

import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";

import { useTableViewStore } from "../store/table-view.store";

interface StudentViewSwitchProps {
  beforeSwitchComponent?: React.ReactNode;
  afterSwitchComponent?: React.ReactNode;
}

export function StudentViewSwitch({
  beforeSwitchComponent,
  afterSwitchComponent,
}: StudentViewSwitchProps) {
  const tableViewStore = useTableViewStore();

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          id="per-student-view"
          onClick={() => {
            if (tableViewStore.view === "STUDENT") {
              tableViewStore.changeView("ATTENDANCE");
            } else {
              tableViewStore.changeView("STUDENT");
            }
          }}
          value={tableViewStore.view}
        />
        <Label htmlFor="per-student-view">Visualização por aluno</Label>
      </div>
      {tableViewStore.view === "STUDENT" && beforeSwitchComponent}
      {tableViewStore.view === "ATTENDANCE" && afterSwitchComponent}
    </>
  );
}
