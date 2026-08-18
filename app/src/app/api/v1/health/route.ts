import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
    const healthCheck = await db.$queryRaw`SELECT 1`;

    if (!healthCheck) {
        return NextResponse.json(
            { error: "Database connection failed" },
            { status: 500 }
        );
    };

    return NextResponse.json(
        { status: 200, message: "OK" });

}