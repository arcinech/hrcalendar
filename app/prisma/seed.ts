import { hashPassword } from "~/server/auth/password";

import { db } from "../src/server/db";

const email = process.env.BOOTSTRAP_HR_EMAIL;
const password = process.env.BOOTSTRAP_HR_PASSWORD;
const firstName = process.env.BOOTSTRAP_HR_FIRST_NAME ?? "HR";
const lastName = process.env.BOOTSTRAP_HR_LAST_NAME ?? "Administrator";

if (!email) {
  throw new Error("BOOTSTRAP_HR_EMAIL is required");
}

if (!password) {
  throw new Error("BOOTSTRAP_HR_PASSWORD is required");
}

if (password.length < 12) {
  throw new Error("BOOTSTRAP_HR_PASSWORD must contain at least 12 characters");
}

const normalizedEmail = email.trim().toLowerCase();

const passwordHash = await hashPassword(password);

const user = await db.user.upsert({
  where: {
    email: normalizedEmail,
  },

  update: {
    passwordHash,
    firstName,
    lastName,
    role: "ROLE_HR",
    status: "ACTIVE",
    archivedAt: null,
  },

  create: {
    email: normalizedEmail,
    passwordHash,
    firstName,
    lastName,
    role: "ROLE_HR",
    status: "ACTIVE",
  },
});

console.log(`HR user ready: ${user.email}`);
