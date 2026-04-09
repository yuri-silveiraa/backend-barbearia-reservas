import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { User } from "../entities/User";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";
import { IUserRepository } from "../repositories/IUserRepository";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../../infra/email/mailer";
import { formatName, isNameValid } from "../utils/formatName";
import { AppError } from "../errors/AppError";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class CreateUser {
  constructor(
    private usersRepository: IUserRepository,
  ) {}

  async execute(data: CreateUserDTO): Promise<{ user: User; code: string }> {
    const userAlreadyExists = await this.usersRepository.findByEmail(
      data.email
    );

    if (userAlreadyExists) {
      throw new UserAlreadyExistsError(data.email);
    }

    if (!isNameValid(data.name)) {
      throw new AppError("Nome deve conter apenas letras");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await this.usersRepository.create({
      name: formatName(data.name),
      email: data.email,
      password: hashedPassword,
      type: "CLIENT",
      telephone: data.telephone,
    });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const cooldownExpiresAt = new Date(Date.now() + 60 * 1000);
    await this.usersRepository.setEmailCode(user.id, code, expiresAt, cooldownExpiresAt);

    const result = await sendVerificationEmail(user.email, code);
    if (!result.sent) {
      console.log(`Código de verificação para ${user.email}: ${code}`);
      console.warn(`Email não enviado: ${result.error}`);
    }
    
    return { user, code };
  }
}
