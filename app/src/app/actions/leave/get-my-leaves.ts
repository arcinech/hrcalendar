import { getUser } from "~/lib/api/authUserSession";
import { db } from "~/server/db";

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
		orderBy: {
			startsOn: "asc",
		},
	});

	return leaves.map((myLeave) => ({
		...myLeave,
		startsOn: myLeave.startsOn.toISOString().slice(0, 10),
		endsOn: myLeave.endsOn.toISOString().slice(0, 10),
	}));
}
