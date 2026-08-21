import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { PasswordForm } from "./password-form";

export default async function ForcePasswordChangePage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/login");
	}

	if (!session.user.mustChangePassword) {
		redirect("/");
	}

	return <PasswordForm />;
}
