import { UserNotFoundError } from "../errors/UserNotFoundError";
import { IUserRepository } from "../repositories/IUserRepository";

export class GetMeUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.getMe(userId);
    if (!user) throw new UserNotFoundError();
    return user;
  }
}