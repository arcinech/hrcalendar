import { hashPassword } from "~/server/auth/password";

import { db } from "../src/server/db";

function date(value: string) {
	return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
	const passwordHash = await hashPassword("12456789", 12);

	const hr = await db.user.upsert({
		where: {
			email: "hr@example.com",
		},
		update: {
			passwordHash,
			firstName: "Anna",
			lastName: "HR",
			employeeNumber: "EMP-HR-001",
			role: "ROLE_HR",
			status: "ACTIVE",
			mustChangePassword: false,
			archivedAt: null,
		},
		create: {
			email: "hr@example.com",
			passwordHash,
			firstName: "Anna",
			lastName: "HR",
			employeeNumber: "EMP-HR-001",
			role: "ROLE_HR",
			status: "ACTIVE",
			mustChangePassword: false,
		},
	});

	const user = await db.user.upsert({
		where: {
			email: "user@example.com",
		},
		update: {
			passwordHash,
			firstName: "Jan",
			lastName: "Kowalski",
			employeeNumber: "EMP-USR-481",
			role: "ROLE_USER",
			status: "ACTIVE",
			mustChangePassword: true,
			archivedAt: null,
		},
		create: {
			email: "user@example.com",
			passwordHash,
			firstName: "Jan",
			lastName: "Kowalski",
			employeeNumber: "EMP-USR-481",
			role: "ROLE_USER",
			status: "ACTIVE",
			mustChangePassword: true,
		},
	});

	await db.entitlement.upsert({
		where: {
			userId_year: {
				userId: user.id,
				year: 2026,
			},
		},
		update: {
			annualLimitDays: 26,
		},
		create: {
			userId: user.id,
			year: 2026,
			annualLimitDays: 26,
		},
	});

	// Make the seed repeatable.
	await db.leaveRequest.deleteMany({
		where: {
			userId: user.id,
		},
	});

	const leaves = [
		{
			startsOn: "2026-07-13",
			endsOn: "2026-07-17",
			type: "ANNUAL" as const,
			status: "APPROVED" as const,
			reason: "Summer holiday",
			publicNote: "Vacation",
			workingDays: 5,
			decidedById: hr.id,
			decidedAt: new Date("2026-07-01T09:00:00.000Z"),
		},
		{
			startsOn: "2026-08-03",
			endsOn: "2026-08-04",
			type: "ANNUAL" as const,
			status: "APPROVED" as const,
			reason: "Short personal leave",
			publicNote: "Out of office",
			workingDays: 2,
			decidedById: hr.id,
			decidedAt: new Date("2026-07-28T10:00:00.000Z"),
		},
		{
			startsOn: "2026-08-20",
			endsOn: "2026-08-21",
			type: "ON_DEMAND" as const,
			status: "APPROVED" as const,
			reason: "Urgent personal matter",
			publicNote: "Personal leave",
			workingDays: 2,
			decidedById: hr.id,
			decidedAt: new Date("2026-08-19T07:30:00.000Z"),
		},
		{
			startsOn: "2026-09-07",
			endsOn: "2026-09-11",
			type: "ANNUAL" as const,
			status: "PENDING" as const,
			reason: "Planned September holiday",
			publicNote: "Planned vacation",
			workingDays: 5,
			decidedById: null,
			decidedAt: null,
		},
		{
			startsOn: "2026-10-12",
			endsOn: "2026-10-14",
			type: "ANNUAL" as const,
			status: "PENDING" as const,
			reason: "Autumn vacation",
			publicNote: "Vacation",
			workingDays: 3,
			decidedById: null,
			decidedAt: null,
		},
	];

	for (const leave of leaves) {
		const createdLeave = await db.leaveRequest.create({
			data: {
				userId: user.id,
				startsOn: date(leave.startsOn),
				endsOn: date(leave.endsOn),
				type: leave.type,
				status: leave.status,
				reason: leave.reason,
				publicNote: leave.publicNote,
				workingDays: leave.workingDays,

				decidedById: leave.decidedById,
				decidedAt: leave.decidedAt,
			},
		});

		const start = date(leave.startsOn);
		const end = date(leave.endsOn);

		const current = new Date(start);

		while (current <= end) {
			const day = current.getUTCDay();
			const working = day !== 0 && day !== 6;

			await db.leaveRequestDay.create({
				data: {
					leaveRequestId: createdLeave.id,
					date: new Date(current),
					working,
					nonWorkingReason: working ? null : "Weekend",

					chargedEntitlementYear:
						working && leave.type === "ANNUAL" ? 2026 : null,

					onDemandYear: working && leave.type === "ON_DEMAND" ? 2026 : null,
				},
			});

			current.setUTCDate(current.getUTCDate() + 1);
		}
	}

	console.log("Seed completed");
	console.log({
		hr: hr.email,
		user: user.email,
		password: "12456789",
	});
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
