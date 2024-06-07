"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { EditClassModalV2 } from "~/components/edit-class-modal-v2";
import { EditTeacherModal } from "~/components/edit-teacher-modal";
import { api } from "~/trpc/react";

export function EditClassModalListener() {
  const [openEditClassModal, setOpenEditClassModal] = useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("turma");

  useEffect(() => {
    if (hash === "editar-turma" && hashValue) {
      setOpenEditClassModal(true);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenEditClassModal(false);
    await Promise.all([
      utils.class.allBySchoolId.invalidate(),
      utils.class.countAllBySchoolId.invalidate(),
      utils.class.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenEditClassModal(false);
    await Promise.all([
      utils.class.allBySchoolId.invalidate(),
      utils.class.countAllBySchoolId.invalidate(),
      utils.class.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  return (
    <EditClassModalV2
      classSlug={hashValue ?? ""}
      open={openEditClassModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
