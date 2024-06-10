"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { NewWorkerModalV2 } from "~/components/new-worker-modal-v2";
import { api } from "~/trpc/react";

export function NewWorkerModalListener() {
  const [openNewWorkerModal, setOpenNewWorkerModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "adicionar-funcionario") {
      setOpenNewWorkerModal(true);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewWorkerModal(false);
    await Promise.all([
      utils.user.allBySchoolId.invalidate(),
      utils.user.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenNewWorkerModal(false);
    await Promise.all([
      utils.user.allBySchoolId.invalidate(),
      utils.user.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewWorkerModalV2
      open={openNewWorkerModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
