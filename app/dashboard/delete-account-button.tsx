"use client";

import { signOut } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteAccountButton() {
  async function handleDelete() {
    const res = await fetch("/api/user", { method: "DELETE" });
    if (res.ok) {
      // compte supprimé -> on déconnecte
      signOut({ callbackUrl: "/register" });
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger className={buttonVariants({ variant: "destructive" })}>
        Supprimer mon compte
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ton compte ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes tes données (ingrédients,
            historique, points) seront définitivement supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Oui, supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
