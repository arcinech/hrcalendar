import { useRouter } from "next/dist/client/components/navigation";
import { useActionState, useState } from "react";
import { changePassword } from "./actions";

const initialState = {
	success: false,
	error: null,
	message: null,
	status: 0,
};

export default function ChangePasswordPage() {
	const router = useRouter();

	const [state, formAction, pending] = useActionState(
		changePassword,
		initialState,
	);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// confirmPassword.length === 0 || newPassword === confirmPassword;

	return (
		<main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
				<h1 className="font-semibold text-2xl">Sign in</h1>

				<div>
					<label className="mb-1 block" htmlFor="email">
						Email
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
					<label className="mb-1 block" htmlFor="password">
						Password
					</label>

					<input
						className="w-full rounded border px-3 py-2"
						id="newPassword"
						onChange={(event) => setPassword(event.target.value)}
						required
						type="password"
						value={newPassword}
					/>

					<input
						className="w-full rounded border px-3 py-2"
						id="confirmPassword"
						onChange={(event) => setNewPassword(event.target.value)}
						required
						type="password"
						value={confirmPassword}
					/>
				</div>

				{error && <p className="text-red-600 text-sm">{error}</p>}

				<button
					className="w-full rounded border px-4 py-2"
					disabled={loading}
					type="submit"
				>
					{loading ? "Signing in..." : "Sign in"}
				</button>
			</form>
		</main>
	);
}
