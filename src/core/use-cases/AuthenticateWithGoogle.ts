import { User } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository";

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
      user = await this.usersRepository.create({
        name: payload.name,
        email: payload.email,
        password: null,
        type: "CLIENT",
        provider: "google",
        providerId: payload.sub,
      });
    }

    return user;
  }
}
