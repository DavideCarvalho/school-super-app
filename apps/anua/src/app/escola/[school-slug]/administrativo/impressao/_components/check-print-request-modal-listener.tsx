"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { CheckPrintRequestModal } from "../containers/check-print-request-modal";

export function CheckPrintRequestModalListener() {
  const [openCheckPrintRequestModal, setOpenCheckPrintRequestModal] =
    useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("impressao");

  useEffect(() => {
    if (hash === "checar-impressao" && hashValue) {
      setOpenCheckPrintRequestModal(true);
    } else {
      setOpenCheckPrintRequestModal(false);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenCheckPrintRequestModal(false);
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenCheckPrintRequestModal(false);
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <CheckPrintRequestModal
      printRequestId={hashValue ?? ""}
      open={openCheckPrintRequestModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
