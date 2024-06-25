import { PrismaClient } from "@prisma/client";
import {
  Kysely,
  MysqlAdapter,
  MysqlIntrospector,
  MysqlQueryCompiler,
} from "kysely";
import kyselyExtension from "prisma-extension-kysely";

import type { DB } from "../prisma/generated/types";

export * from "@prisma/client";
export * from "kysely";
export type { DB } from "../prisma/generated/types";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient & { $kysely: Kysely<DB> };
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  }).$extends(
    kyselyExtension({
      kysely: (driver) =>
        new Kysely<DB>({
          dialect: {
            // This is where the magic happens!
            createDriver: () => driver,
            // Don't forget to customize these to match your database!
            createAdapter: () => new MysqlAdapter(),
            createIntrospector: (db) => new MysqlIntrospector(db),
            createQueryCompiler: () => new MysqlQueryCompiler(),
          },
          plugins: [
            // Add your favorite plugins here!
          ],
        }),
    }),
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
