import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">FridgeSmart</h1>
        <p className="text-muted-foreground">
          Gère ton frigo, suis les dates de péremption et reçois des recettes
          anti-gaspillage générées par IA.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/register" className={buttonVariants()}>
          Créer un compte
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Se connecter
        </Link>
      </div>
    </main>
  );
}
