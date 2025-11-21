import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { User } from "../entities/User";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";
import { IUserRepository } from "../repositories/IUserRepository";
import  bcrypt  from "bcrypt";

export class CreateUser {
  constructor(
    private usersRepository: IUserRepository,
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
    
    return user;
  }
}