import { CreateUser } from "./CreateUser";
import { FakeUsersRepository } from "../../tests/repositories/FakeUserRepository";
import { AppError } from "../errors/AppError";

jest.mock("../../infra/email/mailer", () => ({
  sendVerificationEmail: jest.fn(async () => ({ sent: true }))
}));

describe("CreateUser", () => {
  it("formats and validates name", async () => {
    const usersRepository = new FakeUsersRepository();
    const useCase = new CreateUser(usersRepository);

    await expect(
      useCase.execute({
        name: "Yuri 123",
        email: "yuri@example.com",
        password: "Senha123",
        telephone: "11999999999",
        type: "CLIENT",
      })
    ).rejects.toBeInstanceOf(AppError);

    const result = await useCase.execute({
      name: "YURI PIRES",
      email: "yuri2@example.com",
      password: "Senha123",
      telephone: "11999999999",
      type: "CLIENT",
    });

    expect(result.user.name).toBe("Yuri Pires");
    expect(result.user.emailVerified).toBe(false);
  });

  it("não permite cadastrar cliente com telefone já usado", async () => {
    const usersRepository = new FakeUsersRepository();
    const useCase = new CreateUser(usersRepository);

    await useCase.execute({
      name: "Yuri Pires",
      email: "yuri@example.com",
      password: "Senha123",
      telephone: "11999999999",
      type: "CLIENT",
    });

    await expect(
      useCase.execute({
        name: "Outro Cliente",
        email: "outro@example.com",
        password: "Senha123",
        telephone: "11999999999",
        type: "CLIENT",
      })
    ).rejects.toMatchObject({ message: "Telefone já cadastrado" });
  });
});
