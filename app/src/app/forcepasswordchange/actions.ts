"use server";
import { unauthorized } from "next/navigation";
import { z } from "zod";
import { getUser } from "~/lib/api/authUserSession";
import { hashPassword, verifyPassword } from "~/server/auth/password";
import { db } from "~/server/db";
import { type ChangePasswordState, defaultState } from "./types";

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

export async function changePassword(
	previousState: ChangePasswordState,
	formData: FormData,
) {
	const userAuth = await getUser();

	if (!userAuth?.user?.id) {
		unauthorized();
	}

	if (
		!formData.has("currentPassword") ||
		!formData.has("newPassword") ||
		!formData.has("confirmPassword")
	) {
		return {
			...defaultState,
			error: "Current password and new password are required",
			status: 400,
		};
	}

	const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));

	if (!parsed.success)
		return { ...defaultState, error: "Invalid request data", status: 422 };

	const { currentPassword, newPassword, confirmPassword } = parsed.data;

	if (!currentPassword || !newPassword || !confirmPassword) {
		return { ...defaultState, error: "Invalid request data", status: 422 };
	}

	if (confirmPassword !== newPassword) {
		return { ...defaultState, error: "Invalid request data", status: 422 };
	}

	if (currentPassword === newPassword) {
		return {
			...defaultState,
			error: "New password cannot be the same as the current password",
			status: 400,
		};
	}

	const user = await db.user.findUnique({
		where: {
			id: userAuth.user.id,
		},
		select: {
			id: true,
			passwordHash: true,
			mustChangePassword: true,
		},
	});

	if (!user) {
		return { ...defaultState, error: "User not found", status: 404 };
	}

	if (!user.passwordHash || !user.id) {
		return { ...defaultState, error: "User not found", status: 404 };
	}

	const passwordValid = await verifyPassword(
		user.passwordHash,
		currentPassword,
	);

	if (!passwordValid) {
		return {
			...defaultState,
			error: "Current password is incorrect",
			status: 401,
		};
	}

	const newPasswordHash = await hashPassword(newPassword);

	await db.user.update({
		where: {
			id: user.id,
		},
		data: {
			passwordHash: newPasswordHash,
			mustChangePassword: false,
			status: "ACTIVE",
		},
		select: {
			id: true,
			email: true,
		},
	});

	return {
		...defaultState,
		message: "Password updated successfully",
		status: 201,
		success: true,
	};
}
