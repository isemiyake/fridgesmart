import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const features = [
  { icon: "🧊", title: "Ton frigo en un coup d'œil", text: "Suis tes aliments et leurs dates de péremption avec un code couleur clair." },
  { icon: "🤖", title: "Recettes intelligentes", text: "Des recettes classées selon ce qui périme, pour cuisiner ce que tu as." },
  { icon: "🌍", title: "Impact mesuré", text: "Vois le CO2 que tu économises en évitant le gaspillage." },
  { icon: "🏆", title: "Gamification", text: "Gagne de l'XP et monte les niveaux, de Débutant à Héros Vert." },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <span className="text-5xl">🥗</span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">FridgeSmart</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Gère ton frigo, suis les dates de péremption et reçois des recettes
          anti-gaspillage. Cuisine mieux, jette moins. 🌱
        </p>
        <div className="flex gap-3">
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Créer un compte
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Se connecter
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 pb-20 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border bg-background p-6">
            <div className="mb-2 text-3xl">{f.icon}</div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
