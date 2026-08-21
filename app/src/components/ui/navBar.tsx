"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
	const pathname = usePathname();

	return (
		<nav className="container flex flex-row items-center justify-center gap-12 px-4 py-16">
			{pathname !== "/" && <Link href="/">Home</Link>}
			{pathname !== "/login" && <Link href="/login">Login</Link>}
			{pathname !== "/calendar" && <Link href="/calendar">Calendar</Link>}
			{pathname !== "/manage" && <Link href="/manage">Manage</Link>}
			<Link href="/health2">Health2</Link>
		</nav>
	);
}
