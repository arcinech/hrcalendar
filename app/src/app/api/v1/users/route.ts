"use server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserHR } from "~/lib/api/authUserSession";
import { hashPassword } from "~/server/auth/password";
import { db } from "~/server/db";

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(["ROLE_USER", "ROLE_HR"]),
  employeeNumber: z.string().min(1).max(100).nullable(),
  annualLeaveDays: z.number().int().min(0).max(365).optional(),
  entitlementYear: z.number().int().min(2000).max(2100).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "INVITED"]).optional(),
  temporaryPassword: z.string().min(8).max(100),
});

export async function GET() {
    const userAuth = await getUserHR();

    if(!userAuth) return null;
    const users = await db.user.findMany();

    if (!users) {
        return NextResponse.json(
            {
                error: "No users in db"
            },
            {status: 403}
        )
    }

    return users;
}

export async function POST(request: NextRequest) {
  const userAuth = await getUserHR();
  if(!userAuth) return null;

  let body:unknown;
  try {
    body = await request.json();
  } catch {
  return NextResponse.json(
    { error: "Invalid JSON body" },
    { status: 400 },
  );
}

  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    throw NextResponse.json(
      {
        error: "Invalid request data",
        details: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(
  parsed.data.temporaryPassword,
);

  const user = await db.user.create({
    data: {
      email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      employeeNumber: parsed.data.employeeNumber ?? null,
      role: parsed.data.role ?? "ROLE_USER",
      status: "INVITED",
      passwordHash: passwordHash,
      annualLeaveDays: parsed.data.annualLeaveDays ?? 26,
      entitlementYear: parsed.data.entitlementYear ?? new Date().getFullYear(),
      mustChangePassword: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      createdAt: true,
      annualLeaveDays: true,
      entitlementYear: true,
    },
  });

  return NextResponse.json(user, {
    status: 201,
  });
}