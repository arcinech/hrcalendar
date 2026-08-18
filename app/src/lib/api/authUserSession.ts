"use server";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

export async function getUserId() {
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

export async function getUserHR() {
  const user = await getUserId();

  if (user.role !== "ROLE_HR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}