"use client";
import { useEffect, useState } from "react";
import { healthCheckAction } from "./action";

type HealthState = {
	status: number;
	message: string | null;
	error: string | null;
};

export default function HealthPage() {
	// const [health, setHealth] = useState<HealthState | null>(null);

	// useEffect(() => {
	// 	async function checkHealth() {
	// 		const result = await healthCheckAction();
	// 		setHealth(result);
	// 	}

	// 	checkHealth();
	// }, []);

	return <main>Health test</main>;

	// 	if (!health) {
	// 		return <p>Checking database...</p>;
	// 	}

	// 	if (health.status === 200) {
	// 		return <p>Health OK</p>;
	// 	}

	// 	if (health.status === 500) {
	// 		return <p>DB problems</p>;
	// 	}

	// 	return <p>Unknown status</p>;
	// }
}
