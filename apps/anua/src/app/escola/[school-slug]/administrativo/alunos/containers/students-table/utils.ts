export const rolesInPortuguese = [
  "Diretor",
  "Coordenador",
  "Administrativo",
  "Cantina",
  "Professor",
] as const;

export const rolesEnum = [
  "DIRECTOR",
  "COORDINATOR",
  "ADMINISTRATIVE",
  "CANTEEN",
  "TEACHER",
] as const;

export const rolesMap: Record<string, string> = {};

for (let i = 0; i < rolesEnum.length; i++) {
  const role = rolesEnum[i];
  const roleInPortuguese = rolesInPortuguese[i];
  if (!role) continue;
  if (!roleInPortuguese) continue;
  rolesMap[role] = roleInPortuguese;
}

export function mapRolesInPortugueseToEnum(
  rolesInPortuguese: string[],
): string[] {
  return rolesInPortuguese
    .map((role) => rolesEnum[rolesInPortuguese.findIndex((r) => r === role)])
    .filter(Boolean) as unknown as string[];
}
