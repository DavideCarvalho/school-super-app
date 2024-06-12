"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { EditRequestedPurchaseRequestModalV2 } from "~/components/edit-requested-purchase-request-modal-v2";
import { api } from "~/trpc/react";

export function EditPurchaseRequestModalListener() {
  const [openEditTeacherModal, setOpenEditTeacherModal] = useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("solicitacao");

  useEffect(() => {
    if (hash === "editar-solicitacao" && hashValue) {
      setOpenEditTeacherModal(true);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenEditTeacherModal(false);
    await Promise.all([
      utils.purchaseRequest.allBySchoolId.invalidate(),
      utils.purchaseRequest.countAllBySchoolId.invalidate(),
      utils.teacher.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenEditTeacherModal(false);
    await Promise.all([
      utils.purchaseRequest.allBySchoolId.invalidate(),
      utils.purchaseRequest.countAllBySchoolId.invalidate(),
      utils.teacher.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  return (
    <EditRequestedPurchaseRequestModalV2
      purchaseRequestId={hashValue ?? ""}
      open={openEditTeacherModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
