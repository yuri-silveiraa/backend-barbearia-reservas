import { AuthenticateDTO } from "../dtos/AuthenticateDTO";
import { User } from "../entities/User";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";
import { IUserRepository } from "../repositories/IUserRepository";
import  bcrypt  from "bcrypt";

export class AuthenticateUser {
  constructor(
    private usersRepository: IUserRepository
  ) {}

  async execute(req: AuthenticateDTO): Promise<InvalidCredentialsError | User> {
    const user = await this.usersRepository.findByEmail(req.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatch = await bcrypt.compare(req.password, user.password);
    if (!passwordMatch) {
      throw new InvalidCredentialsError();
    }

    return user;
  }
}