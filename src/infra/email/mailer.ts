import nodemailer from "nodemailer";
import https from "https";
import { env } from "../../config/env";

type SendResult = {
  sent: boolean;
  error?: string;
};

function createTransport() {
  if (!env.mail.enabled || !env.mail.host || !env.mail.from) return null;

  return nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port ?? 587,
    secure: (env.mail.port ?? 587) === 465,
    auth: env.mail.user && env.mail.pass ? { user: env.mail.user, pass: env.mail.pass } : undefined,
  });
}

function sendBrevoEmail(to: string, code: string): Promise<SendResult> {
  if (!env.brevo.enabled || !env.brevo.apiKey || !env.brevo.senderEmail) {
    return Promise.resolve({ sent: false, error: "Brevo API não configurada" });
  }

  const payload = JSON.stringify({
    sender: {
      email: env.brevo.senderEmail,
      name: env.brevo.senderName || "Douglas Barbearia",
    },
    to: [{ email: to }],
    subject: "Código de verificação",
    textContent: `Seu código de verificação é: ${code}`,
    htmlContent: `<p>Seu código de verificação é: <strong>${code}</strong></p>`,
  });

  return new Promise((resolve) => {
    const req = https.request(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          "api-key": env.brevo.apiKey,
          "content-type": "application/json",
          "accept": "application/json",
          "content-length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ sent: true });
            return;
          }
          resolve({
            sent: false,
            error: `Brevo API error (${res.statusCode}): ${body || "sem detalhes"}`,
          });
        });
      }
    );

    req.on("error", (error) => {
      resolve({
        sent: false,
        error: error instanceof Error ? error.message : "Erro ao chamar Brevo API",
      });
    });

    req.write(payload);
    req.end();
  });
}

export async function sendVerificationEmail(to: string, code: string): Promise<SendResult> {
  if (env.brevo.enabled) {
    return sendBrevoEmail(to, code);
  }

  const transport = createTransport();
  if (!transport) {
    return { sent: false, error: "Email provider não configurado" };
  }

  try {
    await transport.sendMail({
      from: env.mail.from,
      to,
      subject: "Código de verificação",
      text: `Seu código de verificação é: ${code}`,
      html: `<p>Seu código de verificação é: <strong>${code}</strong></p>`,
    });
    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar email";
    return { sent: false, error: message };
  }
}
