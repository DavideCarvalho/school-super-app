const statusesInPortuguese = [
  "Pedido",
  "Aprovado",
  "Rejeitado",
  "Comprado",
  "Chegou",
] as const;

const statusesEnum = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "BOUGHT",
  "ARRIVED",
] as const;

export function mapStatusesInPortugueseToEnum(
  statusesInPortuguese: string[],
): ("REQUESTED" | "APPROVED" | "REJECTED" | "BOUGHT" | "ARRIVED")[] {
  return statusesInPortuguese
    .map(
      (status) =>
        statusesEnum[statusesInPortuguese.findIndex((s) => s === status)],
    )
    .filter(Boolean) as unknown as (typeof statusesEnum)[];
}
