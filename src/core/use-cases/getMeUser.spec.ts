import { GetMeUser } from "./getMeUser";
import { FakeUsersRepository } from "../../tests/repositories/FakeUserRepository";
import { UserNotFoundError } from "../errors/UserNotFoundError";

describe("GetMeUser", () => {
  const usersRepository = new FakeUsersRepository();
  const sut = new GetMeUser(usersRepository);

  it("deve retornar o usuário pelo ID", async () => {
    const createdUser = await usersRepository.create({
      name: "Yuri",
      email: "yuri@teste.com",
      password: "hashed",
      type: "CLIENT",
    });

    const user = await sut.execute(createdUser.id);

    expect(user).toHaveProperty("id", createdUser.id);
    expect(user.name).toBe("Yuri");
    expect(user.email).toBe("yuri@teste.com");
  });

  it("deve lançar erro se o usuário não existir", async () => {
    await expect(sut.execute("non-existent-id")).rejects.toThrow(UserNotFoundError);
  });
});
