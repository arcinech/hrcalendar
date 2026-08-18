"use server";
import { NextResponse } from "next/server";
import { getUserId } from "~/lib/api/authUserSession";
import { db } from "~/server/db";

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

  if (user.status === "ARCHIVED") {
    return NextResponse.json(
      {
        error: "User is archived",
      },
      { status: 403 },
    );
  }

  return NextResponse.json(user);
}
