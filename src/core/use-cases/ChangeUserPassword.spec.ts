import bcrypt from "bcrypt";
import { FakeUsersRepository } from "../../tests/repositories/FakeUserRepository";
import { AppError } from "../errors/AppError";
import { ChangeUserPassword } from "./ChangeUserPassword";

function makeUser(overrides: Partial<Parameters<FakeUsersRepository["create"]>[0]> = {}) {
  return {
    name: "Yuri Pires",
    email: `yuri-${Math.random()}@example.com`,
    password: "hashed",
    type: "CLIENT" as const,
    telephone: `1199${Math.floor(Math.random() * 10000000).toString().padStart(7, "0")}`,
    emailVerified: true,
    emailCode: null,
    emailCodeExpires: null,
    emailCodeCooldownExpires: null,
    provider: null,
    providerId: null,
    ...overrides,
  };
}

describe("ChangeUserPassword", () => {
  it("troca a senha quando a senha atual está correta", async () => {
    const usersRepository = new FakeUsersRepository();
    const password = await bcrypt.hash("Senha123", 10);
    const user = await usersRepository.create(makeUser({ password }));
    const useCase = new ChangeUserPassword(usersRepository);

    const updated = await useCase.execute({
      userId: user.id,
      currentPassword: "Senha123",
      newPassword: "Nova123",
      confirmPassword: "Nova123",
    });

    expect(updated.password).not.toBe(password);
    await expect(bcrypt.compare("Nova123", updated.password ?? "")).resolves.toBe(true);
  });

  it("rejeita senha atual incorreta", async () => {
    const usersRepository = new FakeUsersRepository();
    const user = await usersRepository.create(makeUser({
      password: await bcrypt.hash("Senha123", 10),
    }));
    const useCase = new ChangeUserPassword(usersRepository);

    await expect(useCase.execute({
      userId: user.id,
      currentPassword: "Errada123",
      newPassword: "Nova123",
      confirmPassword: "Nova123",
    })).rejects.toMatchObject({ message: "Senha atual incorreta" });
  });

  it("rejeita confirmação diferente da nova senha", async () => {
    const usersRepository = new FakeUsersRepository();
    const user = await usersRepository.create(makeUser({
      password: await bcrypt.hash("Senha123", 10),
    }));
    const useCase = new ChangeUserPassword(usersRepository);

    await expect(useCase.execute({
      userId: user.id,
      currentPassword: "Senha123",
      newPassword: "Nova123",
      confirmPassword: "Outra123",
    })).rejects.toBeInstanceOf(AppError);
  });

  it("rejeita senha fraca", async () => {
    const usersRepository = new FakeUsersRepository();
    const user = await usersRepository.create(makeUser({
      password: await bcrypt.hash("Senha123", 10),
    }));
    const useCase = new ChangeUserPassword(usersRepository);

    await expect(useCase.execute({
      userId: user.id,
      currentPassword: "Senha123",
      newPassword: "fraca",
      confirmPassword: "fraca",
    })).rejects.toBeInstanceOf(AppError);
  });

  it("permite criar senha para usuário Google sem senha atual", async () => {
    const usersRepository = new FakeUsersRepository();
    const user = await usersRepository.create(makeUser({
      password: null,
      provider: "google",
      providerId: "google-user-1",
    }));
    const useCase = new ChangeUserPassword(usersRepository);

    const updated = await useCase.execute({
      userId: user.id,
      newPassword: "Nova123",
      confirmPassword: "Nova123",
    });

    expect(updated.password).toBeTruthy();
    await expect(bcrypt.compare("Nova123", updated.password ?? "")).resolves.toBe(true);
  });
});
