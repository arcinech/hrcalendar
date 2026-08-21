"use server";
import { db } from "~/server/db";

export async function healthCheckAction() {
	const healthCheck = await db.$queryRaw`SELECT 1`;

	if (!healthCheck) {
		return {
			...{
				error: "Database connection failed",
				status: 500,
				message: null,
			},
		};
	}

	return { ...{ status: 200, message: "OK", error: null } };
}
