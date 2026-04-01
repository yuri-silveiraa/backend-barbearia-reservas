import { GenerateTimeSlots } from "./GenerateTimeSlots";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("GenerateTimeSlots", () => {
  let timeRepository: FakeTimeRepository;
  let barberRepository: FakeBarberRepository;
  let sut: GenerateTimeSlots;

  beforeEach(async () => {
    timeRepository = new FakeTimeRepository();
    barberRepository = new FakeBarberRepository();
    sut = new GenerateTimeSlots(timeRepository, barberRepository);

    await barberRepository.create({
      userId: "barbeiro-user-1",
      isAdmin: false,
    });
  });

  it("deve retornar erro se horário final menor que inicial", async () => {
    const config = {
      startTime: "21:00",
      endTime: "08:00",
      blockDuration: 30,
      startDate: "2026-04-10",
      endDate: "2026-04-10",
    };

    const result = await sut.execute("barbeiro-user-1", config);

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.error).toBe("Horário final deve ser maior que horário inicial");
  });

  it("deve retornar erro se duração do bloco menor que 15 minutos", async () => {
    const config = {
      startTime: "08:00",
      endTime: "21:00",
      blockDuration: 10,
      startDate: "2026-04-10",
      endDate: "2026-04-10",
    };

    const result = await sut.execute("barbeiro-user-1", config);

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.error).toBe("Duração do bloco deve estar entre 15 e 180 minutos");
  });

  it("deve retornar erro se duração do bloco maior que período total", async () => {
    const config = {
      startTime: "08:00",
      endTime: "10:00",
      blockDuration: 180,
      startDate: "2026-04-10",
      endDate: "2026-04-10",
    };

    const result = await sut.execute("barbeiro-user-1", config);

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.error).toBe("Duração do bloco maior que o período total");
  });

  it("deve retornar warning se bloco não cobre perfeitamente o período", async () => {
    const config = {
      startTime: "08:00",
      endTime: "10:00",
      blockDuration: 45,
      startDate: "2026-04-10",
      endDate: "2026-04-10",
    };

    const result = await sut.execute("barbeiro-user-1", config);

    expect(result.validation.isValid).toBe(true);
    expect(result.validation.warning).toBeDefined();
    expect(result.validation.warning?.options).toHaveLength(2);
  });

  it("deve gerar horários corretamente com configuração válida", async () => {
    const config = {
      startTime: "08:00",
      endTime: "10:00",
      blockDuration: 60,
      startDate: "2026-04-10",
      endDate: "2026-04-10",
    };

    const result = await sut.execute("barbeiro-user-1", config, {
      start: "08:00",
      end: "10:00",
    });

    expect(result.validation.isValid).toBe(true);
    expect(result.timeSlots).toHaveLength(2);
  });

  it("deve gerar horários pulando intervalo de almoço", async () => {
    const config = {
      startTime: "08:00",
      endTime: "18:00",
      blockDuration: 60,
      intervalStart: "12:00",
      intervalDuration: 60,
      startDate: "2026-04-10",
      endDate: "2026-04-10",
    };

    const result = await sut.execute("barbeiro-user-1", config);

    expect(result.validation.isValid).toBe(true);
    const morningSlots = result.timeSlots.filter((s) => {
      const hour = new Date(s.date).getHours();
      return hour < 12;
    });
    const afternoonSlots = result.timeSlots.filter((s) => {
      const hour = new Date(s.date).getHours();
      return hour >= 13;
    });
    expect(morningSlots.length).toBe(4);
    expect(afternoonSlots.length).toBe(5);
  });

  it("deve gerar horários para múltiplos dias", async () => {
    const config = {
      startTime: "08:00",
      endTime: "09:00",
      blockDuration: 60,
      startDate: "2026-04-10",
      endDate: "2026-04-12",
    };

    const result = await sut.execute("barbeiro-user-1", config);

    expect(result.validation.isValid).toBe(true);
    expect(result.timeSlots.length).toBeGreaterThan(0);
  });

  it("deve excluir dias da semana especificados", async () => {
    const config = {
      startTime: "08:00",
      endTime: "09:00",
      blockDuration: 60,
      startDate: "2026-04-08",
      endDate: "2026-04-14",
      excludeDays: [0, 6],
    };

    const result = await sut.execute("barbeiro-user-1", config);

    expect(result.validation.isValid).toBe(true);
  });

  it("deve retornar erro se data no passado", async () => {
    const config = {
      startTime: "08:00",
      endTime: "09:00",
      blockDuration: 60,
      startDate: "2020-01-01",
      endDate: "2020-01-01",
    };

    await expect(sut.execute("barbeiro-user-1", config)).rejects.toThrow(
      "Não é possível criar horários no passado"
    );
  });
});
