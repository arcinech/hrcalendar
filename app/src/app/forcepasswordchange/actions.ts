"use server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "~/lib/api/authUserSession";
import { hashPassword, verifyPassword } from "~/server/auth/password";
import { db } from "~/server/db";

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(8).max(100),
		newPassword: z
			.string()
			.min(8)
			.max(100)
			.refine((password) => /[A-Z]/.test(password), {
				message: "Need at least one uppercase letter",
			})
			.refine((password) => /[a-z]/.test(password), {
				message: "Need at least one lowercase letter",
			})
			.refine((password) => /[0-9]/.test(password), {
				message: "Need at least one number",
			})
			.refine((password) => /[!@#$%^&*]/.test(password), {
				message: "Need at least one special character",
			}),
		confirmPassword: z.string().min(1),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

type ChangePasswordState = {
	success?: boolean | false;
	error?: string | null;
	message?: string | null;
	status: number;
};

export async function changePassword(
	previousState: ChangePasswordState,
	formData: FormData,
) {
	const userAuth = await getUser();

	if (
		!formData.has("currentPassword") ||
		!formData.has("newPassword") ||
		!formData
	) {
		return {
			error: "Current password and new password are required",
			status: 400,
		};
	}

	const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));

	if (!parsed.success) return { error: "Invalid request data", status: 422 };

	const { currentPassword, newPassword, confirmPassword } = parsed.data;

	if (!currentPassword || !newPassword || !confirmPassword) {
		return { error: "Invalid request data", status: 422 };
	}

	if (confirmPassword !== newPassword) {
		return { error: "Invalid request data", status: 422 };
	}

	if (currentPassword === newPassword) {
		return {
			error: "New password cannot be the same as the current password",
			status: 400,
		};
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
		return { error: "User not found", status: 404 };
	}

	if (!user.passwordHash) {
		return { error: "User not found", status: 404 };
	}

	const passwordValid = await verifyPassword(
		currentPassword,
		user.passwordHash,
	);

	if (!passwordValid) {
		return { error: "Current password is incorrect", status: 401 };
	}

	const newPasswordHash = await hashPassword(newPassword);

	await db.user.update({
		where: {
			id: userAuth.id,
		},
		data: {
			passwordHash: newPasswordHash,
			mustChangePassword: false,
			temporaryPassword: null,
			status: "ACTIVE",
		},
		select: {
			id: true,
			email: true,
		},
	});

	return {
		message: "Password updated successfully",
		status: 201,
		success: true,
	};
}
