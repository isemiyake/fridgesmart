import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { NavBar } from "@/components/nav-bar";
import { Fridge } from "./fridge";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Mon réfrigérateur</h1>
          <p className="text-muted-foreground">
            Ajoute tes aliments et suis leurs dates de péremption.
          </p>
        </div>
        <Fridge />
      </main>
    </>
  );
}
