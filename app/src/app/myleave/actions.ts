"use server";
import { z } from "zod";
import { LeaveType } from "~/generated/prisma/client";
import { getUser } from "~/lib/api/authUserSession";
import { db } from "~/server/db";

export async function myLeaves() {
	const session = await getUser();

	const myLeaves = await db.leaveRequest.findMany({
		where: {
			userId: session.user.id,
		},
	});

	return myLeaves;
}

type PossibleStates = {
	error?: string | null;
	message?: string | null;
	status: number;
};

export const defaultState: PossibleStates = {
	error: null,
	message: null,
	status: 0,
};
//Create new leave
const newLeaveSchema = z.object({
	startData: z.date(),
	endDate: z.date(),
	type: z.nativeEnum(LeaveType),
	reason: z.string(),
	publicNote: z.string().optional(),
});

export async function newLeave(formData: FormData) {
	const session = await getUser();

	if (!session)
		return {
			...defaultState,
			error: "Could not authenticate session",
			code: 401,
		};

	if (
		!formData.has("startDate") ||
		!formData.has("reason") ||
		!formData.has("type") ||
		!formData.has("endDate")
	) {
		return {
			...defaultState,
			error: "Not all required fields filled",
			status: 400,
		};
	}

	const parsed = newLeaveSchema.safeParse(formData);

	if (parsed?.error)
		return { ...defaultState, error: "Invalid request data", status: 422 };

	const user = await db.user.findUnique({ where: { id: session.user.id } });
	if (!user?.id) return null;

	await db.leaveRequest.create({
		data: {
			userId: user.id,
			startsOn: parsed.data.startData,
			endsOn: parsed.data.endDate,
			type: parsed.data.type,
			publicNote: parsed.data.publicNote,
			reason: parsed.data.reason,
		},
	});

	return {
		...defaultState,
		message: "Leave is pending",
		status: 200,
	};
}
