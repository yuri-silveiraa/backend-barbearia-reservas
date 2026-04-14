import { CreateBarber } from "./CreateBarber";
import { FakeUsersRepository } from "../../tests/repositories/FakeUserRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";
import { AppError } from "../errors/AppError";
import bcrypt from "bcrypt";

describe("CreateBarber", () => {
  const usersRepository = new FakeUsersRepository();
  const barberRepository = new FakeBarberRepository();
  const sut = new CreateBarber(usersRepository, barberRepository);

  it("deve criar um barbeiro com senha hasheada", async () => {
    const data = {
      name: "Carlos",
      email: "carlos@barbearia.com",
      password: "123456",
      type: "BARBER" as const,
      telephone: "11999999999",
    };

    const user = await sut.execute(data, false);

    expect(user).toHaveProperty("id");
    expect(user.name).toBe(data.name);
    expect(user.email).toBe(data.email);
    expect(user.type).toBe("BARBER");
    expect(user.emailVerified).toBe(true);

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    expect(passwordMatch).toBe(true);

    const barber = await barberRepository.findByUserId(user.id);
    expect(barber).not.toBeNull();
    expect(barber?.isAdmin).toBe(false);
  });

  it("deve criar um barbeiro admin quando isAdmin for true", async () => {
    const data = {
      name: "Admin",
      email: "admin@barbearia.com",
      password: "123456",
      type: "BARBER" as const,
      telephone: "11999999998",
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
      telephone: "11999999997",
    };

    await expect(sut.execute(data, false)).rejects.toThrow(UserAlreadyExistsError);
  });

  it("deve lançar erro se o telefone já existir", async () => {
    const usersRepository = new FakeUsersRepository();
    const barberRepository = new FakeBarberRepository();
    const sut = new CreateBarber(usersRepository, barberRepository);

    await sut.execute({
      name: "Carlos",
      email: "carlos-novo@barbearia.com",
      password: "123456",
      type: "BARBER",
      telephone: "11999999999",
    });

    await expect(
      sut.execute({
        name: "Joao",
        email: "joao@barbearia.com",
        password: "123456",
        type: "BARBER",
        telephone: "11999999999",
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
