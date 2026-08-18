import { verifyPassword, hashPassword } from "~/server/auth/password";
import { NextResponse, type NextRequest } from "next/server";
import { getUserId } from "~/lib/api/authUserSession";
import { z } from "zod";
import { db } from "~/server/db";


// {
//   "currentPassword": "temporary-password",
//   "newPassword": "new-secure-password"
// }

const createPasswordSchema = z.object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    });

export async function PATCH(request: NextRequest) {
    const userAuth = await getUserId();
    if (!userAuth) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = createPasswordSchema.parse(body);

    if (!currentPassword || !newPassword) {
        return NextResponse.json(
            { error: "Current password and new password are required"},
            { status: 400}
        )
    }

    if (currentPassword !== newPassword) {
        return NextResponse.json({
            error: "New password cannot be the same as the current password"
        }, 
        { status: 400})
    }
};