import { User } from "../entities/User";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";
import { IUserRepository } from "../repositories/IUserRepository";
import bcrypt from "bcrypt";

interface CreateClientDTO {
  name: string;
  email: string;
  password: string;
  telephone?: string;
}

export class CreateUser {
  constructor(
    private usersRepository: IUserRepository,
  ) {}

  async execute(data: CreateClientDTO): Promise<User> {
    const userAlreadyExists = await this.usersRepository.findByEmail(
      data.email
    );

    if (userAlreadyExists) {
      throw new UserAlreadyExistsError(data.email);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      type: "CLIENT",
    });
    
    return user;
  }
}