"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Class } from "@acme/db";

import SelectWithSearch from "~/components/ui/select-with-search";
import { api } from "~/trpc/react";

export function ClassesSelect() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [classes] = api.class.allBySchoolId.useSuspenseQuery({
    limit: 999,
  });
  const [selectedClass, setSelectedClass] = useState<Class | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!searchParams) return;
    const selectedClassParam = searchParams.get("classe");
    if (!selectedClassParam) return;
    const foundClass = classes.find(
      (clasz) => clasz.slug === selectedClassParam,
    );
    if (foundClass?.id !== selectedClass?.id) {
      setSelectedClass(() => foundClass);
    }
  }, [searchParams, selectedClass, classes]);
  return (
    <SelectWithSearch
      label="Turmas"
      options={
        classes.map((clasz) => ({
          label: clasz.name,
          value: clasz.id,
        })) || []
      }
      selectedOption={
        selectedClass
          ? { label: selectedClass.name, value: selectedClass.id }
          : undefined
      }
      onSelect={(option) => {
        const selectedClass = classes.find((clasz) => clasz.id === option);
        if (!selectedClass) return;
        const newSearchParams = new URLSearchParams(searchParams?.toString());
        newSearchParams.set("classe", selectedClass.slug);
        router.push(`${pathname}?${newSearchParams.toString()}`);
      }}
    />
  );
}
