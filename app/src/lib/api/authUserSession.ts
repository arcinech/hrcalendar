"use server";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

export async function getUser() {
	const authUser = await auth();

	if (!authUser?.user?.id) {
		return {
			error: "Unauthorized",
			status: 401,
			success: false as const,
		};
	}

	return {
		success: true as const,
		user: { ...authUser.user, id: authUser.user.id },
	};
}

export async function getUserHR() {
	const authUser = await getUser();

	if (!authUser.success) {
		return authUser;
	}

	if (authUser.user.role !== "ROLE_HR") {
		return {
			success: false as const,
			error: "Forbidden",
			status: 403,
		};
	}

	return {
		success: true as const,
		user: { ...authUser.user, id: authUser.user.id },
	};
}
