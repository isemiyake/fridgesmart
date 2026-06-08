import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const history = await prisma.cookedHistory.findMany({
    where: { userId },
    orderBy: { cookedAt: "desc" },
  });

  let co2Total = 0;
  let ingredientsSaved = 0;
  const recent = [];
  for (const h of history) {
    co2Total += h.co2Saved;
    let title = "Recette";
    try {
      const snap = JSON.parse(h.recipeSnapshot);
      ingredientsSaved += snap.ingredients?.length ?? 0;
      title = snap.title ?? title;
    } catch {
      // snapshot illisible -> on ignore
    }
    recent.push({
      title,
      co2Saved: h.co2Saved,
      xpEarned: h.xpEarned,
      cookedAt: h.cookedAt,
    });
  }

  const xpRow = await prisma.userXP.findUnique({ where: { userId } });

  return NextResponse.json({
    co2Total,
    recipesCount: history.length,
    ingredientsSaved,
    xp: xpRow?.xp ?? 0,
    level: xpRow?.level ?? 1,
    history: recent.slice(0, 10),
  });
}
