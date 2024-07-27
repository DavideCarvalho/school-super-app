"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { api } from "~/trpc/react";
import { NewAttendanceModal } from "../containers/new-attendance-modal";

interface NewAttendanceModalListenerProps {
  classId: string;
  subjectId: string;
}

export function NewAttendanceModalListener({
  classId,
  subjectId,
}: NewAttendanceModalListenerProps) {
  const [openNewAttendanceModal, setOpenNewAttendanceModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "adicionar-presenca") {
      setOpenNewAttendanceModal(true);
    } else {
      setOpenNewAttendanceModal(false);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewAttendanceModal(false);
    await Promise.all([
      utils.subject.allBySchoolId.invalidate(),
      utils.subject.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenNewAttendanceModal(false);
    await Promise.all([
      utils.subject.allBySchoolId.invalidate(),
      utils.subject.countAllBySchoolId.invalidate(),
      utils.subject.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewAttendanceModal
      classId={classId}
      subjectId={subjectId}
      open={openNewAttendanceModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
