import { NextResponse } from "next/server";
import { getAdminCredentials, saveAdminCredentials } from "@/lib/data";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function GET() {
  const creds = getAdminCredentials();
  if (!creds) {
    return NextResponse.json({ error: "Aucun administrateur configuré" }, { status: 404 });
  }
  return NextResponse.json({ email: creds.email });
}

export async function PATCH(request: Request) {
  try {
    const creds = getAdminCredentials();
    if (!creds) {
      return NextResponse.json({ error: "Aucun administrateur configuré" }, { status: 404 });
    }

    const { email, currentPassword, newPassword } = await request.json();

    if (!verifyPassword(currentPassword, creds.passwordHash)) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
    }

    const update: { email?: string; passwordHash?: string } = {};

    if (email && email !== creds.email) {
      update.email = email;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
      }
      update.passwordHash = hashPassword(newPassword);
    }

    if (!update.email && !update.passwordHash) {
      return NextResponse.json({ error: "Aucune modification fournie" }, { status: 400 });
    }

    saveAdminCredentials({
      email: update.email ?? creds.email,
      passwordHash: update.passwordHash ?? creds.passwordHash,
    });

    return NextResponse.json({ success: true, email: update.email ?? creds.email });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
