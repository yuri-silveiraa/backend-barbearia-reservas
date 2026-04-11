import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { User } from "../entities/User";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";
import { IUserRepository } from "../repositories/IUserRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import bcrypt from "bcrypt";

export class CreateBarber {
  constructor(
    private usersRepository: IUserRepository,
    private barberRepository: IBarbersRepository,
  ) {}

  async execute(data: CreateUserDTO, isAdmin: boolean = false): Promise<User> {
    const userAlreadyExists = await this.usersRepository.findByEmail(data.email);

    if (userAlreadyExists) {
      throw new UserAlreadyExistsError(data.email);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
      type: "BARBER",
    });

    await this.barberRepository.create({
      userId: user.id,
      isAdmin,
    });

    return user;
  }
}
