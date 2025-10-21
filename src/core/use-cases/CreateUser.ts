import { User } from "../entities/User";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { IClientsRepository } from "../repositories/IClientRepository";
import { IUsersRepository } from "../repositories/IUserRepository";

export class CreateUser {
  constructor(
    private usersRepository: IUsersRepository,
    private barbersRepository: IBarbersRepository,
    private clientsRepository: IClientsRepository
  ) {}

  async execute(data: User): Promise<User> {
    const userAlreadyExists = await this.usersRepository.findByEmail(
      data.email
    );

    if (userAlreadyExists) {
      throw new Error("Email ja esta em uso.");
    }

    const user = await this.usersRepository.create(data);
    
    if (user.type == "BARBER") {
      await this.barbersRepository.create({ userId: user.id });
    }

    if (user.type == "CLIENT") {
      await this.clientsRepository.create({ userId: user.id, telephone: "" });
    }
    
    return user;
  }
}