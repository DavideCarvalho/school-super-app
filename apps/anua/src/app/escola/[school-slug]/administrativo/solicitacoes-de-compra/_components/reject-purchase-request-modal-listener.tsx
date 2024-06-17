"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { RejectPurchaseRequestModal } from "../containers/reject-purchase-request-modal";

export function RejectPurchaseRequestModalListener() {
  const [openRejectPurchaseRequestModal, setOpenRejectPurchaseRequestModal] =
    useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("solicitacao");

  useEffect(() => {
    if (hash === "rejeitar-solicitacao") {
      setOpenRejectPurchaseRequestModal(true);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenRejectPurchaseRequestModal(false);
    await Promise.all([
      utils.purchaseRequest.allBySchoolId.invalidate(),
      utils.purchaseRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenRejectPurchaseRequestModal(false);
    await Promise.all([
      utils.purchaseRequest.allBySchoolId.invalidate(),
      utils.purchaseRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <RejectPurchaseRequestModal
      purchaseRequestId={hashValue ?? ""}
      open={openRejectPurchaseRequestModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
