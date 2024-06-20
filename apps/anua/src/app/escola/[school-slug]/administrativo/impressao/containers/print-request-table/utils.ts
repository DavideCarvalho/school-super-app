export const statusesInPortuguese = [
  "Pedido",
  "Aprovado",
  "Rejeitado",
  "Revisão",
] as const;

export const statusesEnum = [
  "REQUESTED",
  "APPROVED",
  "PRINTED",
  "REVIEW",
] as const;

type StatusesEnum = (typeof statusesEnum)[number];

export function mapStatusesInPortugueseToEnum(
  statusesInPortuguese: string[],
): StatusesEnum[] {
  return statusesInPortuguese
    .map((status) => {
      const statusInPortuguese =
        statusesInPortuguese[statusesInPortuguese.indexOf(status)];
      if (!statusInPortuguese) return "REQUESTED";
      if (!status) return "REQUESTED";
      return statusesEnum[statusesInPortuguese.indexOf(statusInPortuguese)];
    })
    .filter((status): status is StatusesEnum => status !== undefined);
}
