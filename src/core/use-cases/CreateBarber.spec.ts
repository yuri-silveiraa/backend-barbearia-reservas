import { CreateBarber } from "./CreateBarber";
import { FakeUsersRepository } from "../../tests/repositories/FakeUserRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { FakeBalanceRepository } from "../../tests/repositories/FakeBalanceRepository";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";
import bcrypt from "bcrypt";

describe("CreateBarber", () => {
  const usersRepository = new FakeUsersRepository();
  const barberRepository = new FakeBarberRepository();
  const balanceRepository = new FakeBalanceRepository();
  const sut = new CreateBarber(usersRepository, barberRepository, balanceRepository);

  it("deve criar um barbeiro com senha hasheada", async () => {
    const data = {
      name: "Carlos",
      email: "carlos@barbearia.com",
      password: "123456",
      type: "BARBER" as const,
    };

    const user = await sut.execute(data, false);

    expect(user).toHaveProperty("id");
    expect(user.name).toBe(data.name);
    expect(user.email).toBe(data.email);
    expect(user.type).toBe("BARBER");

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    expect(passwordMatch).toBe(true);

    const barber = await barberRepository.findByUserId(user.id);
    expect(barber).not.toBeNull();
    expect(barber?.isAdmin).toBe(false);

    const balance = await balanceRepository.findByBarberId(barber!.id);
    expect(balance).not.toBeNull();
  });

  it("deve criar um barbeiro admin quando isAdmin for true", async () => {
    const data = {
      name: "Admin",
      email: "admin@barbearia.com",
      password: "123456",
      type: "BARBER" as const,
    };

    const user = await sut.execute(data, true);

    const barber = await barberRepository.findByUserId(user.id);
    expect(barber?.isAdmin).toBe(true);
  });

  it("deve lançar erro se o email já existir", async () => {
    const data = {
      name: "Carlos",
      email: "carlos@barbearia.com",
      password: "123456",
      type: "BARBER" as const,
    };

    await expect(sut.execute(data, false)).rejects.toThrow(UserAlreadyExistsError);
  });
});
