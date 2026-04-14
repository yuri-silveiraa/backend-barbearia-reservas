import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { User } from "../entities/User";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";
import { IUserRepository } from "../repositories/IUserRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError";

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

    const telephoneAlreadyExists = await this.usersRepository.findByTelephone(data.telephone);
    if (telephoneAlreadyExists) {
      throw new AppError("Telefone já cadastrado", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
      type: "BARBER",
      emailVerified: true,
    });

    await this.barberRepository.create({
      userId: user.id,
      isAdmin,
    });

    return user;
  }
}
