import { User } from "../entities/User";
import { IUsersRepository } from "../repositories/IUserRepository";

export class CreateUser {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(data: User): Promise<User> {
    const userAlreadyExists = await this.usersRepository.findByEmail(
      data.email
    );

    if (userAlreadyExists) {
      throw new Error("Email ja esta em uso.");
    }

    const user = await this.usersRepository.create(data);

    return user;
  }
}