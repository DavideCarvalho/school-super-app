"use client";

import { Button } from "@acme/ui/button";

import { CalendarFormClient } from "./containers/calendar-form/calendar-form.client";

export default function NewAcademicPeriodPage() {
  return (
    <>
      <h2 className="text-xl font-semibold">Novo período letivo</h2>
      <div className="flex w-full flex-col gap-4">
        <CalendarFormClient />
      </div>
    </>
  );
}
