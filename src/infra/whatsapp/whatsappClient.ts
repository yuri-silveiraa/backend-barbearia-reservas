import { fetch } from "undici";
import { env } from "../../config/env";

type TemplateParam = { type: "text"; text: string };

export async function sendWhatsAppText(to: string, body: string) {
  if (!env.whatsapp.token || !env.whatsapp.phoneNumberId) {
    throw new Error("WhatsApp não configurado");
  }

  const url = `https://graph.facebook.com/v19.0/${env.whatsapp.phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.whatsapp.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao enviar WhatsApp: ${response.status} ${text}`);
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  language: string,
  params: string[]
) {
  if (!env.whatsapp.token || !env.whatsapp.phoneNumberId) {
    throw new Error("WhatsApp não configurado");
  }

  const url = `https://graph.facebook.com/v19.0/${env.whatsapp.phoneNumberId}/messages`;
  const parameters: TemplateParam[] = params.map((text) => ({ type: "text", text }));
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.whatsapp.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: [
          {
            type: "body",
            parameters,
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao enviar WhatsApp: ${response.status} ${text}`);
  }
}
