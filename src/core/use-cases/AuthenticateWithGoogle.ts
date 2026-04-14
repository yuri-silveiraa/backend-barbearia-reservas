import { User } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository";
import { prisma } from "../../infra/database/prisma/prismaClient";
import { formatName } from "../utils/formatName";

export interface GoogleUserPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export class AuthenticateWithGoogle {
  constructor(
    private usersRepository: IUserRepository
  ) {}

  async execute(payload: GoogleUserPayload): Promise<User> {
    let user = await this.usersRepository.findByProviderId(payload.sub);

    if (!user) {
      const existingUser = await this.usersRepository.findByEmail(payload.email);

      if (existingUser) {
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            provider: "google",
            providerId: payload.sub,
            emailVerified: true,
          }
        });
      } else {
        user = await this.usersRepository.create({
          name: formatName(payload.name),
          email: payload.email,
          password: null,
          type: "CLIENT",
          provider: "google",
          providerId: payload.sub,
          telephone: `google:${payload.sub}`,
          emailVerified: true,
        });
      }
    }

    return user;
  }
}
