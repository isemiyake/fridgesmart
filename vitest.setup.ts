import { readFileSync } from "fs";

// Charge les variables du .env pour les tests qui touchent la base (sinon ignorés).
try {
  const content = readFileSync(".env", "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2].replace(/^"(.*)"$/, "$1");
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch {
  // pas de .env (ex: CI) -> les tests d'intégration BD seront ignorés
}
