"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { ReviewPrintRequestModal } from "../containers/review-print-request-modal";

export function ReviewPrintRequestModalListener() {
  const [openReviewPrintRequestModal, setOpenReviewPrintRequestModal] =
    useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("impressao");

  useEffect(() => {
    if (
      (hash === "revisar-impressao" || hash === "editar-impressao") &&
      hashValue
    ) {
      setOpenReviewPrintRequestModal(true);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenReviewPrintRequestModal(false);
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenReviewPrintRequestModal(false);
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <ReviewPrintRequestModal
      printRequestId={hashValue ?? ""}
      open={openReviewPrintRequestModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
