import { AuthenticateUser } from "./AuthenticateUser";
import { FakeUsersRepository } from "../../tests/repositories/FakeUserRepository";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";
import bcrypt from "bcrypt";

describe("AuthenticateUser", () => {
  const usersRepository = new FakeUsersRepository();
  const sut = new AuthenticateUser(usersRepository);

  it("deve lançar um InvalidCredentialsError ao tentar autenticar com credenciais inválidas", async () => {
    const req = { email: "yuri.com", password: "wrongpassword" };
    
    const response = await sut.execute(req);

    expect(response).toEqual(new InvalidCredentialsError());
  });

  it("deve retornar um usuário ao autenticar com credenciais válidas", async () => {

    const validUser = {
      name: "Yuri",
      email: "yuri@teste.com",
      password: "123456",
      type: "BARBER" as const,
      createdAt: new Date(),
    };
    validUser.password = await bcrypt.hash(validUser.password, 6);
    const userValid = await usersRepository.create(validUser);

    const req = {
      email: validUser.email,
      password: "123456",
    };
    const response = await sut.execute(req);

    expect(response).toEqual(userValid);
  });
});

