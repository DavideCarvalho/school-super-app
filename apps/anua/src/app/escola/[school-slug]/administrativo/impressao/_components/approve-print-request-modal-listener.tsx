"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { ApprovePrintRequestModal } from "../containers/approve-print-request-modal";

export function ApprovePrintRequestModalListener() {
  const [openApprovePrintRequestModal, setOpenApprovePrintRequestModal] =
    useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("impressao");

  useEffect(() => {
    if (hash === "aprovar-impressao" && hashValue) {
      setOpenApprovePrintRequestModal(true);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenApprovePrintRequestModal(false);
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenApprovePrintRequestModal(false);
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <ApprovePrintRequestModal
      printRequestId={hashValue ?? ""}
      open={openApprovePrintRequestModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
