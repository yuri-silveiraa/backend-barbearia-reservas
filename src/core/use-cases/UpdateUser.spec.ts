import { UpdateUser } from "./UpdateUser";
import { FakeUsersRepository } from "../../tests/repositories/FakeUserRepository";
import { AppError } from "../errors/AppError";

describe("UpdateUser", () => {
  it("rejects invalid names and formats valid ones", async () => {
    const usersRepository = new FakeUsersRepository();
    const user = await usersRepository.create({
      name: "Yuri Pires",
      email: "yuri@example.com",
      password: "hashed",
      type: "CLIENT",
      telephone: "11999999999",
      emailVerified: true,
      emailCode: null,
      emailCodeExpires: null,
      emailCodeCooldownExpires: null,
      provider: null,
      providerId: null,
    });

    const useCase = new UpdateUser(usersRepository);

    await expect(
      useCase.execute({ userId: user.id, name: "Yuri 123" })
    ).rejects.toBeInstanceOf(AppError);

    const updated = await useCase.execute({ userId: user.id, name: "YURI PIRES" });
    expect(updated.name).toBe("Yuri Pires");
  });

  it("salva e remove foto de perfil", async () => {
    const usersRepository = new FakeUsersRepository();
    const user = await usersRepository.create({
      name: "Yuri Pires",
      email: "yuri@example.com",
      password: "hashed",
      type: "CLIENT",
      telephone: "11999999999",
      emailVerified: true,
      emailCode: null,
      emailCodeExpires: null,
      emailCodeCooldownExpires: null,
      provider: null,
      providerId: null,
    });

    const useCase = new UpdateUser(usersRepository);
    const updated = await useCase.execute({
      userId: user.id,
      profileImageBase64: Buffer.from("fake-image").toString("base64"),
      profileImageMimeType: "image/png",
    });

    expect(updated.profileImageData).toBeDefined();
    expect(updated.profileImageMimeType).toBe("image/png");

    const removed = await useCase.execute({
      userId: user.id,
      removeProfileImage: true,
    });

    expect(removed.profileImageData).toBeNull();
    expect(removed.profileImageMimeType).toBeNull();
  });

  it("rejeita foto de perfil com formato invalido", async () => {
    const usersRepository = new FakeUsersRepository();
    const user = await usersRepository.create({
      name: "Yuri Pires",
      email: "yuri@example.com",
      password: "hashed",
      type: "CLIENT",
      telephone: "11999999999",
      emailVerified: true,
      emailCode: null,
      emailCodeExpires: null,
      emailCodeCooldownExpires: null,
      provider: null,
      providerId: null,
    });

    const useCase = new UpdateUser(usersRepository);

    await expect(
      useCase.execute({
        userId: user.id,
        profileImageBase64: Buffer.from("fake-image").toString("base64"),
        profileImageMimeType: "image/svg+xml",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("não permite atualizar para telefone já usado por outro usuário", async () => {
    const usersRepository = new FakeUsersRepository();
    const user = await usersRepository.create({
      name: "Yuri Pires",
      email: "yuri@example.com",
      password: "hashed",
      type: "CLIENT",
      telephone: "11999999999",
      emailVerified: true,
      emailCode: null,
      emailCodeExpires: null,
      emailCodeCooldownExpires: null,
      provider: null,
      providerId: null,
    });
    await usersRepository.create({
      name: "Outro Usuario",
      email: "outro@example.com",
      password: "hashed",
      type: "CLIENT",
      telephone: "11888888888",
      emailVerified: true,
      emailCode: null,
      emailCodeExpires: null,
      emailCodeCooldownExpires: null,
      provider: null,
      providerId: null,
    });

    const useCase = new UpdateUser(usersRepository);

    await expect(
      useCase.execute({ userId: user.id, telephone: "11888888888" })
    ).rejects.toMatchObject({ message: "Telefone já cadastrado" });
  });
});
