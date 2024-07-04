"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { api } from "~/trpc/react";
import { NewAssignmentModal } from "../containers/new-assignment-modal";

interface NewAssignmentModalListenerProps {
  classId: string;
}

export function NewAssignmentModalListener({
  classId,
}: NewAssignmentModalListenerProps) {
  const [openNewAssignmentModal, setOpenNewAssignmentModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "adicionar-atividade") {
      setOpenNewAssignmentModal(true);
    } else {
      setOpenNewAssignmentModal(false);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewAssignmentModal(false);
    await Promise.all([
      utils.assignment.getCurrentAcademicPeriodAssignments.invalidate(),
      utils.assignment.countCurrentAcademicPeriodAssignments.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenNewAssignmentModal(false);
    await Promise.all([
      utils.assignment.getCurrentAcademicPeriodAssignments.invalidate(),
      utils.assignment.countCurrentAcademicPeriodAssignments.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewAssignmentModal
      classId={classId}
      open={openNewAssignmentModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
