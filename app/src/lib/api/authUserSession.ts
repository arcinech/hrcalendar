"use server";
import { forbidden, unauthorized } from "next/navigation";
import { auth } from "~/server/auth";

export async function getUser() {
	const authUser = await auth();

	if (!authUser?.user?.id) {
		unauthorized();
	}

	return {
		user: { ...authUser.user, id: authUser.user.id },
	};
}

export async function getUserHR() {
	const authUser = await getUser();

	if (!authUser?.user) {
		return authUser;
	}

	if (authUser.user.role !== "ROLE_HR") {
		forbidden();
	}

	return {
		user: { ...authUser.user, id: authUser.user.id },
	};
}
