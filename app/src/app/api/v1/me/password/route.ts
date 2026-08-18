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
    newPassword: z.string().min(8).max(100).refine((password) => /[A-Z]/.test(password), {
    message: 'Need at least one uppercase letter',
  })
  .refine((password) => /[a-z]/.test(password), {
    message: 'Need at least one lowercase letter',
  })
  .refine((password) => /[0-9]/.test(password), { message: 'Need at least one number' })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: 'Need at least one    special character',
  }),
});


export async function PATCH(request: NextRequest) {
    const userAuth = await getUserId();
    if (!userAuth) {
        return new Response("Unauthorized", { status: 401 });
    }

    let body:unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 },
        );
    }

    const { currentPassword, newPassword } = createPasswordSchema.parse(body);

    if (!currentPassword || !newPassword) {
        return NextResponse.json(
            { error: "Current password and new password are required"},
            { status: 400}
        )
    }

    if (currentPassword === newPassword) {
        return NextResponse.json({
            error: "New password cannot be the same as the current password"
        }, 
        { status: 400})
    }

    const user = await db.user.findUnique({
        where: {
            id: userAuth.id,
        },
        select: {
            temporaryPassword: true,
            passwordHash: true,
            mustChangePassword: true,
        },
    });

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    if (!user.passwordHash) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    const newPasswordHash = await hashPassword(newPassword);


};