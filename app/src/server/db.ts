import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "~/env";
import { PrismaClient } from "~/generated/prisma/client";

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
  });
};

const globalForPrisma = globalThis as unknown as {
  db: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.db ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}
