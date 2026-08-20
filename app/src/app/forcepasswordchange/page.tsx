import { useRouter } from "next/dist/client/components/navigation";
import { useActionState, useEffect, useState } from "react";
import { signOut } from "~/server/auth";
import { changePassword, defaultState } from "./actions";

export default function ChangePasswordPage() {
	const router = useRouter();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [state, formAction, pending] = useActionState(
		changePassword,
		defaultState,
	);

	const confirmValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setConfirmPassword(value);
		e.target.setCustomValidity(
			value !== newPassword ? "Passwords do not match" : "",
		);
	};

	const passwordsMatch = newPassword === confirmPassword;

	useEffect(() => {
		if (!state.success) return;

		const logout = async () => {
			await signOut({ redirect: false });

			router.replace("/login");
			router.refresh();
		};

		void logout();
	}, [state.success, router]);

	return (
		<main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<form action={formAction} className="w-full max-w-sm space-y-4">
				<h1 className="font-semibold text-2xl">Change Password</h1>

				<div>
					<label className="mb-1 block" htmlFor="currentPassword">
						Old Password
					</label>

					<input
						autoComplete="current-password"
						className="w-full rounded border px-3 py-2"
						id="currentPassword"
						onChange={(event) => setCurrentPassword(event.target.value)}
						required
						type="password"
						value={currentPassword}
					/>
				</div>

				<div>
					<label className="mb-1 block" htmlFor="newpassword">
						New Password
					</label>

					<input
						className="w-full rounded border px-3 py-2"
						id="newPassword"
						onChange={(event) => setNewPassword(event.target.value)}
						pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,100}"
						required
						title="Minimum 8 characters, uppercase, lowercase, number and special character."
						type="password"
						value={newPassword}
					/>
				</div>
				<div>
					<label className="mb-1 block" htmlFor="confirmPassword">
						Confirm Password
					</label>

					<input
						className="w-full rounded border px-3 py-2"
						id="confirmPassword"
						onChange={(e) => {
							confirmValue(e);
						}}
						required
						type="password"
						value={confirmPassword}
					/>
					{!passwordsMatch && (
						<p className="text-red-600 text-sm">Passwords do not match</p>
					)}
				</div>

				{state.error && <p className="text-red-600 text-sm">{state.error}</p>}

				<button
					className="w-full rounded border px-4 py-2"
					disabled={pending}
					type="submit"
				>
					{pending ? "Changing..." : "Password Changed"}
				</button>
			</form>
		</main>
	);
}
