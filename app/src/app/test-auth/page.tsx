import { auth } from "~/server/auth";

export default async function TestAuthPage() {
  const session = await auth();

  return (
    <main>
      <h1>Authentication test</h1>

      <pre>{JSON.stringify(session, null, 2)}</pre>
    </main>
  );
}
