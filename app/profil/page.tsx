import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountButton } from "@/app/dashboard/delete-account-button";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { xp: true, _count: { select: { cookedHistory: true, ingredients: true } } },
  });

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Mon profil</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Mon compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membre depuis</span>
              <span className="font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("fr-BE")
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Niveau</span>
              <span className="font-medium">{user?.xp?.level ?? 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ingrédients dans le frigo</span>
              <span className="font-medium">{user?._count.ingredients ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recettes réalisées</span>
              <span className="font-medium">{user?._count.cookedHistory ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-700">Zone de danger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              La suppression de ton compte efface définitivement toutes tes
              données (ingrédients, historique, points). Cette action est
              irréversible.
            </p>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
