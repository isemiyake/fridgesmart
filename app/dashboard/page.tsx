import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { DeleteAccountButton } from "./delete-account-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Bonjour {session.user?.email}</h1>
      <p className="text-muted-foreground">Bienvenue sur ton frigo FridgeSmart.</p>
      <div className="flex gap-3">
        <LogoutButton />
        <DeleteAccountButton />
      </div>
    </main>
  );
}
