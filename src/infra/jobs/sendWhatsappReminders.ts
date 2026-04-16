import { DateTime } from "luxon";
import { prisma } from "../database/prisma/prismaClient";
import { env } from "../../config/env";
import { sendWhatsAppTemplate, sendWhatsAppText } from "../whatsapp/whatsappClient";

export function formatPhoneE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `55${digits}`;
  }
  if (digits.length === 13 && digits.startsWith("55")) {
    return digits;
  }
  return null;
}

export function buildReminderMessage(name: string, time: string, service: string) {
  return `Olá, ${name}! Lembrete: você tem um horário hoje às ${time} para ${service}. Até já!`;
}

export async function sendDailyWhatsappReminders() {
  if (!env.whatsapp.token || !env.whatsapp.phoneNumberId) {
    console.log("WhatsApp não configurado. Pulei o envio de lembretes.");
    return;
  }

  const nowSp = DateTime.now().setZone("America/Sao_Paulo");
  const startOfDay = nowSp.startOf("day").toJSDate();
  const endOfDay = nowSp.endOf("day").toJSDate();

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "SCHEDULED",
      clientId: { not: null },
      scheduledAt: { gte: startOfDay, lte: endOfDay },
    },
    select: {
      id: true,
      scheduledAt: true,
      serviceName: true,
      client: { select: { user: { select: { name: true, telephone: true } } } },
    },
  });

  for (const appointment of appointments) {
    const name = appointment.client.user.name;
    const service = appointment.serviceName;
    const phone = appointment.client.user.telephone;
    const to = formatPhoneE164(phone);

    if (!to) {
      console.warn(`Telefone inválido para lembrete: ${phone} (agendamento ${appointment.id})`);
      continue;
    }

    const time = DateTime.fromJSDate(appointment.scheduledAt)
      .setZone("America/Sao_Paulo")
      .toFormat("HH:mm");

    try {
      if (env.whatsapp.templateName) {
        await sendWhatsAppTemplate(
          to,
          env.whatsapp.templateName,
          env.whatsapp.templateLanguage,
          [name, time, service]
        );
      } else {
        const message = buildReminderMessage(name, time, service);
        await sendWhatsAppText(to, message);
      }
    } catch (error) {
      console.error(`Falha ao enviar lembrete para ${to} (agendamento ${appointment.id})`, error);
    }
  }
}
