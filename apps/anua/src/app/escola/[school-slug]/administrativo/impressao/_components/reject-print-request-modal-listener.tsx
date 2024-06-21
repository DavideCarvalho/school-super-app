"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { RejectPrintRequestModal } from "../containers/reject-print-request-modal";

export function RejectPrintRequestModalListener() {
  const [openRejectPrintRequestModal, setOpenRejectPrintRequestModal] =
    useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("impressao");

  useEffect(() => {
    if (hash === "rejeitar-impressao" && hashValue) {
      setOpenRejectPrintRequestModal(true);
    } else {
      setOpenRejectPrintRequestModal(false);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenRejectPrintRequestModal(false);
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenRejectPrintRequestModal(false);
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <RejectPrintRequestModal
      printRequestId={hashValue ?? ""}
      open={openRejectPrintRequestModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
