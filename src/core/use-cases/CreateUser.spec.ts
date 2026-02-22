import { CreateUser } from "./CreateUser";
import { FakeUsersRepository } from "../../tests/repositories/FakeUserRepository";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";

describe("CreateUser", () => {
  const usersRepository = new FakeUsersRepository();
  const sut = new CreateUser(usersRepository);

  it("deve criar um novo usuário com senha hasheada", async () => {
    const data = {
      name: "Yuri",
      email: "yuri@teste.com",
      password: "123456",
      type: "CLIENT" as const,
    };

    const user = await sut.execute(data);

    expect(user).toHaveProperty("id");
    expect(user.name).toBe(data.name);
    expect(user.email).toBe(data.email);
    expect(user.type).toBe(data.type);
    expect(user.password).toMatch(/^\$2b\$/);
  });

  it("deve lançar erro se o email já existir", async () => {
    const data = {
      name: "Yuri",
      email: "yuri@teste.com",
      password: "123456",
      type: "CLIENT" as const,
    };

    await expect(sut.execute(data)).rejects.toThrow(UserAlreadyExistsError);
  });
});
