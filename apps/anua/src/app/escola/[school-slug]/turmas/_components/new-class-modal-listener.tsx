"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { NewClassModalV2 } from "~/components/new-class-modal-v2";
import { api } from "~/trpc/react";

export function NewClassModalListener() {
  const [openNewClassModal, setOpenNewClassModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "adicionar-turma") {
      setOpenNewClassModal(true);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewClassModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenNewClassModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewClassModalV2
      open={openNewClassModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
