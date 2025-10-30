import { AuthenticateDTO } from "../dtos/AuthenticateDTO";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";
import { IUserRepository } from "../repositories/IUserRepository";
import  bcrypt  from "bcrypt";

export class AuthenticateUser {
  constructor(
    private usersRepository: IUserRepository
  ) {}

  async execute(req: AuthenticateDTO) {
    const user = await this.usersRepository.findByEmail(req.email);
    if (!user) {
      return new InvalidCredentialsError();
    }

    const passwordMatch = await bcrypt.compare(req.password, user.password);
    if (!passwordMatch) {
      return new InvalidCredentialsError();
    }

    return user;
  }
}