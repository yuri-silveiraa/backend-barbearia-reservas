import { AppError } from "../errors/AppError";

export function normalizeCustomerName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s)([\p{L}])/gu, (_, separator: string, letter: string) => `${separator}${letter.toLocaleUpperCase("pt-BR")}`);
}

export function assertCustomerName(value: string): string {
  const normalized = normalizeCustomerName(value);
  if (!normalized || !/^[\p{L}\s.'-]+$/u.test(normalized)) {
    throw new AppError("Nome do cliente deve conter apenas letras", 400);
  }
  return normalized;
}

export function normalizeWhatsapp(value: string): string {
  return value.replace(/\D/g, "");
}

export function assertWhatsapp(value: string): string {
  const normalized = normalizeWhatsapp(value);
  if (normalized.length < 10 || normalized.length > 13) {
    throw new AppError("WhatsApp inválido", 400);
  }
  return normalized;
}
