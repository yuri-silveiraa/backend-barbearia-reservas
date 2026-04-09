import { AuthenticateWithGoogle } from "./AuthenticateWithGoogle";
import { FakeUsersRepository } from "../../tests/repositories/FakeUserRepository";

describe("AuthenticateWithGoogle", () => {
  it("creates user with verified email and formatted name", async () => {
    const usersRepository = new FakeUsersRepository();
    const useCase = new AuthenticateWithGoogle(usersRepository);

    const user = await useCase.execute({
      sub: "google-sub-1",
      email: "yuri@example.com",
      name: "YURI PIRES",
      picture: "http://example.com/avatar.png",
    });

    expect(user.emailVerified).toBe(true);
    expect(user.name).toBe("Yuri Pires");
  });
});
