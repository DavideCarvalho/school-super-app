"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { EditClassModal } from "../containers/edit-class-modal";

export function EditClassModalListener() {
  const [openEditClassModal, setOpenEditClassModal] = useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("turma");

  useEffect(() => {
    if (hash === "editar-turma" && hashValue) {
      setOpenEditClassModal(true);
    } else {
      setOpenEditClassModal(false);
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
    <EditClassModal
      classSlug={hashValue ?? ""}
      open={openEditClassModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
