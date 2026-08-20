"use client";

import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event: { preventDefault: () => void }) {
		event.preventDefault();

		setLoading(true);
		setError(null);

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid email or password");
				return;
			}

			const session = await getSession();

			if (!session?.user) {
				setError("Could not load session");
				return;
			}

			if (session.user.mustChangePassword) {
				router.replace("/forcepasswordchange");
				return;
			}

			router.push("/");
			router.refresh();
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
				<h1 className="font-semibold text-2xl">Sign in</h1>

				<div>
					<label className="mb-1 block" htmlFor="email">
						Email
					</label>

					<input
						autoComplete="email"
						className="w-full rounded border px-3 py-2"
						id="email"
						onChange={(event) => setEmail(event.target.value)}
						required
						type="email"
						value={email}
					/>
				</div>

				<div>
					<label className="mb-1 block" htmlFor="password">
						Password
					</label>

					<input
						autoComplete="current-password"
						className="w-full rounded border px-3 py-2"
						id="password"
						onChange={(event) => setPassword(event.target.value)}
						required
						type="password"
						value={password}
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
