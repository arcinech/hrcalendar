"use server";
import { TreesIcon } from "lucide-react";
import { z } from "zod";
import { LeaveType } from "~/generated/prisma/client";
import { getUser } from "~/lib/api/authUserSession";
import { db } from "~/server/db";
import { initialState } from "~/types/actionFormTypes";

export async function myLeaves() {
	const session = await getUser();

	const leaves = await db.leaveRequest.findMany({
		where: {
			userId: session.user.id,
		},
		select: {
			id: true,
			startsOn: true,
			endsOn: true,
			reason: true,
			status: true,
			publicNote: true,
		},
	});

	return leaves.map((myLeave) => ({
		...myLeave,
		startsOn: myLeave.startsOn.toISOString().slice(0, 10),
		endsOn: myLeave.endsOn.toISOString().slice(0, 10),
	}));
}

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
			...initialState,
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
			...initialState,
			error: "Not all required fields filled",
			status: 400,
		};
	}

	const parsed = newLeaveSchema.safeParse(formData);

	if (parsed?.error)
		return { ...initialState, error: "Invalid request data", status: 422 };

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
		...initialState,
		message: "Leave is pending",
		status: 200,
	};
}
