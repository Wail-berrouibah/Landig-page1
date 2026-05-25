import { NextResponse } from "next/server";
import { getAdminCredentials, saveAdminCredentials, saveVerificationCode, getVerificationCode, deleteVerificationCode } from "@/lib/data";
import { hashPassword } from "@/lib/auth";
import { sendVerificationCode } from "@/lib/email";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { step } = body;

    if (step === "send-code") {
      const { email, password, confirmPassword } = body;

      if (!email || !password || !confirmPassword) {
        return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
      }

      if (password !== confirmPassword) {
        return NextResponse.json({ error: "Les mots de passe ne correspondent pas" }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
      }

      if (getAdminCredentials()) {
        return NextResponse.json({ error: "Un administrateur existe déjà" }, { status: 400 });
      }

      const code = generateCode();
      const passwordHash = hashPassword(password);

      saveVerificationCode(email.toLowerCase(), {
        code,
        passwordHash,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`\n[DEV] Verification code for ${email}: ${code}\n`);
      } else {
        try {
          await sendVerificationCode(email, code);
        } catch {
          return NextResponse.json(
            { error: "Erreur d'envoi d'email. Vérifiez votre configuration SMTP." },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ success: true });
    }

    if (step === "verify") {
      const { email, code } = body;

      if (!email || !code) {
        return NextResponse.json({ error: "Email et code requis" }, { status: 400 });
      }

      const stored = getVerificationCode(email.toLowerCase());

      if (!stored) {
        return NextResponse.json({ error: "Aucun code trouvé. Veuillez recommencer." }, { status: 400 });
      }

      if (Date.now() > stored.expiresAt) {
        deleteVerificationCode(email);
        return NextResponse.json({ error: "Le code a expiré. Veuillez recommencer." }, { status: 400 });
      }

      if (stored.code !== code) {
        return NextResponse.json({ error: "Code incorrect" }, { status: 400 });
      }

      saveAdminCredentials({ email: email.toLowerCase(), passwordHash: stored.passwordHash });
      deleteVerificationCode(email);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  const exists = getAdminCredentials() !== null;
  return NextResponse.json({ adminExists: exists });
}
