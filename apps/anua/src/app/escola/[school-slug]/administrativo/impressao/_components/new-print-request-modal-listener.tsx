"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { api } from "~/trpc/react";
import { NewPrintRequestModal } from "../containers/new-print-request-modal";

export function NewPrintRequestModalListener() {
  const [openNewPrintRequestModal, setOpenNewPrintRequestModal] =
    useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "nova-impressao") {
      setOpenNewPrintRequestModal(true);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewPrintRequestModal(false);
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenNewPrintRequestModal(false);
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewPrintRequestModal
      open={openNewPrintRequestModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
