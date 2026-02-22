import { AuthenticateUser } from "./AuthenticateUser";
import { FakeUsersRepository } from "../../tests/repositories/FakeUserRepository";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";
import bcrypt from "bcrypt";

describe("AuthenticateUser", () => {
  const usersRepository = new FakeUsersRepository();
  const sut = new AuthenticateUser(usersRepository);

  it("deve lançar um InvalidCredentialsError ao tentar autenticar com email inexistente", async () => {
    const req = { email: "naoexiste@teste.com", password: "wrongpassword" };
    
    await expect(sut.execute(req)).rejects.toThrow(InvalidCredentialsError);
  });

  it("deve retornar um usuário ao autenticar com credenciais válidas", async () => {
    const validUser = {
      name: "Yuri",
      email: "yuri@teste.com",
      password: "123456",
      type: "BARBER" as const,
    };
    validUser.password = await bcrypt.hash(validUser.password, 6);
    const userValid = await usersRepository.create(validUser);

    const req = {
      email: validUser.email,
      password: "123456",
    };
    const response = await sut.execute(req);

    expect(response).toHaveProperty("id", userValid.id);
    expect((response as any).email).toBe(userValid.email);
    expect((response as any).name).toBe(userValid.name);
  });

  it("deve lançar InvalidCredentialsError com senha incorreta", async () => {
    const validUser = {
      name: "Yuri2",
      email: "yuri2@teste.com",
      password: "123456",
      type: "BARBER" as const,
    };
    validUser.password = await bcrypt.hash(validUser.password, 6);
    await usersRepository.create(validUser);

    const req = {
      email: validUser.email,
      password: "senhaerrada",
    };

    await expect(sut.execute(req)).rejects.toThrow(InvalidCredentialsError);
  });
});

