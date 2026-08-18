"use server";
import { NextResponse, NextRequest } from "next/server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(["ROLE_USER", "ROLE_HR"]),
  employeeNumber: z.string().min(1).max(100).nullable(),
});

async function getUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  return { ...session.user, id: session.user.id };
}

export async function GET() {
  const userAuth = await getUserId();

  const user = await db.user.findUnique({
    where: {
      id: userAuth.id,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        error: "User or password is not correct",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(user);
}

export async function POST(request: NextRequest) {
  const session = await getUserId();

  if (session.role !== "ROLE_HR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: unknown = await request.json();

  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    throw NextResponse.json(
      {
        error: "Invalid request data",
        details: parsed.error.flatten(),
      },
      { status: 400 },
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

  const user = await db.user.create({
    data: {
      email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      employeeNumber: parsed.data.employeeNumber ?? null,
      role: parsed.data.role,
      status: "INVITED",
      passwordHash: null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, {
    status: 201,
  });
}
