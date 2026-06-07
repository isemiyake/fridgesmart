import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { DeleteAccountButton } from "./delete-account-button";
import { Fridge } from "./fridge";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Mon frigo</h1>
          <p className="text-sm text-muted-foreground">{session.user?.email}</p>
        </div>
        <div className="flex gap-2">
          <LogoutButton />
          <DeleteAccountButton />
        </div>
      </div>
      <Fridge />
    </main>
  );
}
