import test, { describe, it } from "node:test";
import { AuthenticateUser } from "./AuthenticateUser";
import { PrismaUsersRepository } from "../../infra/database/repositories/PrismaUsersRepository";

describe("AuthenticateUser", () => {
  test("tentando autenticar um usuário com credenciais inválidas", async (t) => {
    it("deve lançar um InvalidCredentialsError", async () => {
      const usersRepository = new PrismaUsersRepository();
      const sut = new AuthenticateUser(usersRepository);
    });
  });

  test("tentando autenticar um usuário com credenciais válidas", async (t) => {
    it("deve retornar um usuário", async () => {
      // Test implementation goes here
    });
  });
});
