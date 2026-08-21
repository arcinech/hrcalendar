"use client";

import { useActionState } from "react";

import { requestLeave } from "~/app/actions/leave/request-leave";
import { defaultState } from "~/app/actions/leave/types";

export function RequestLeaveForm() {
	const [state, formAction, pending] = useActionState(
		requestLeave,
		defaultState,
	);

	return (
		<form action={formAction}>
			{/* fields */}

			<button disabled={pending} type="submit">
				Request leave
			</button>

			{state.error && <p>{state.error}</p>}
		</form>
	);
}
