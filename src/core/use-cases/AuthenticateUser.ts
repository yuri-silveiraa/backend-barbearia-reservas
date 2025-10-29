import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";
import { IUserRepository } from "../repositories/IUserRepository";
import  bcrypt  from "bcrypt";

export class AuthenticateUser {
  constructor(
    private usersRepository: IUserRepository
  ) {}

  async execute(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!user || !passwordMatch) {
      throw new InvalidCredentialsError();
    }

    return user;
  }
}