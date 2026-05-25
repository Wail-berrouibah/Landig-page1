import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendVerificationCode(email: string, code: string): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"TechPro Admin" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Votre code de vérification TechPro",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#1e3a3a">Code de vérification</h2>
      <p style="color:#6b7280">Utilisez le code ci-dessous pour finaliser la création de votre compte administrateur :</p>
      <div style="background:#faf8f5;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
        <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1e3a3a">${code}</span>
      </div>
      <p style="color:#6b7280;font-size:14px">Ce code expire dans 5 minutes.</p>
    </div>`,
  });
}
