import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminCredentials, saveAdminCredentials } from "@/lib/data";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    let stored = getAdminCredentials();

    if (!stored) {
      const envEmail = process.env.ADMIN_EMAIL;
      const envPassword = process.env.ADMIN_PASSWORD;

      if (!envEmail || !envPassword) {
        return NextResponse.json(
          { error: "Aucun administrateur configuré. Définissez ADMIN_EMAIL et ADMIN_PASSWORD dans .env" },
          { status: 500 }
        );
      }

      if (email !== envEmail || password !== envPassword) {
        return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
      }

      stored = { email: envEmail, passwordHash: hashPassword(envPassword) };
      saveAdminCredentials(stored);
    } else {
      if (email !== stored.email || !verifyPassword(password, stored.passwordHash)) {
        return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
      }
    }

    const token = btoa(`admin:${Date.now()}:${Math.random().toString(36).slice(2)}`);
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
