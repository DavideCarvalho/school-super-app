"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { api } from "~/trpc/react";
import { NewWorkerModal } from "../containers/new-worker-modal";

export function NewWorkerModalListener() {
  const [openNewWorkerModal, setOpenNewWorkerModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "adicionar-funcionario") {
      setOpenNewWorkerModal(true);
    } else {
      setOpenNewWorkerModal(false);
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
    <NewWorkerModal
      open={openNewWorkerModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
