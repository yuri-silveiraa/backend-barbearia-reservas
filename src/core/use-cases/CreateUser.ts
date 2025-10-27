import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { User } from "../entities/User";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { IClientsRepository } from "../repositories/IClientRepository";
import { IUsersRepository } from "../repositories/IUserRepository";
import  bcrypt  from "bcrypt";

export class CreateUser {
  constructor(
    private usersRepository: IUsersRepository,
    private barbersRepository: IBarbersRepository,
    private clientsRepository: IClientsRepository
  ) {}

  async execute(data: CreateUserDTO): Promise<User> {
    const userAlreadyExists = await this.usersRepository.findByEmail(
      data.email
    );

    if (userAlreadyExists) {
      throw new UserAlreadyExistsError(data.email);
    }

    data.password = await bcrypt.hash(data.password, 10);
    const user = await this.usersRepository.create(data);

    if (user.type == "BARBER") {
      await this.barbersRepository.create({ userId: user.id });
    }

    if (user.type == "CLIENT") {
      await this.clientsRepository.create({ userId: user.id, telephone: data.telephone });
    }
    
    return user;
  }
}