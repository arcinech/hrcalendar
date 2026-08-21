// actions/leave/request-leave.ts
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "~/lib/api/authUserSession";
import { requestLeaveSchema } from "~/lib/leave/schemas";
import { db } from "~/server/db";
import type { ActionFormTypes } from "~/types/actionFormTypes";

export async function requestLeave(
	_previousState: ActionFormTypes,
	formData: FormData,
) {
	const session = await getUser();

	const parsed = requestLeaveSchema.safeParse({
		startsOn: formData.get("startsOn"),
		endsOn: formData.get("endsOn"),
		reason: formData.get("reason"),
		publicNote: formData.get("publicNote"),
	});

	if (!parsed.success) {
		return {
			// success: false as const,
			error: "Invalid data",
			status: 401,
		};
	}

	await db.leaveRequest.create({
		data: {
			userId: session.user.id,
			startsOn: new Date(parsed.data.startsOn),
			endsOn: new Date(parsed.data.endsOn),
			reason: parsed.data.reason,
			publicNote: parsed.data.publicNote,
		},
	});

	revalidatePath("/my-leaves");

	return {
		// success: true as const,
		// error: null,
	};
}
