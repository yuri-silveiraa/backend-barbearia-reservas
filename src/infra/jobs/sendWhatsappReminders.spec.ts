import { buildReminderMessage, formatPhoneE164 } from "./sendWhatsappReminders";

describe("sendWhatsappReminders helpers", () => {
  it("formats phone numbers to E.164", () => {
    expect(formatPhoneE164("11 91234-5678")).toBe("5511912345678");
    expect(formatPhoneE164("5511912345678")).toBe("5511912345678");
    expect(formatPhoneE164("123")).toBeNull();
  });

  it("builds reminder message", () => {
    const message = buildReminderMessage("Yuri", "09:30", "Corte");
    expect(message).toContain("Yuri");
    expect(message).toContain("09:30");
    expect(message).toContain("Corte");
  });
});
