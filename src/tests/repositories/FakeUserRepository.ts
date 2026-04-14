import { User } from "../../core/entities/User";
import { IUserRepository } from "../../core/repositories/IUserRepository";


export class FakeUsersRepository implements IUserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async create(data: Omit<User, "id" | "createdAt">): Promise<User> {
    const newUser: User = {
      id: String(this.users.length + 1),
      createdAt: new Date(),
      ...data,
      emailVerified: data.emailVerified ?? false,
    };
    this.users.push(newUser);
    return newUser;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async deleteById(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
  }

  async getMe(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async update(
    id: string,
    data: Partial<Pick<User, "name" | "email" | "telephone" | "password" | "provider" | "providerId" | "emailVerified" | "emailCode" | "emailCodeExpires" | "emailCodeCooldownExpires" | "profileImageData" | "profileImageMimeType">>
  ): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error("Usuário não encontrado");
    }
    const updated = { ...this.users[userIndex], ...data };
    this.users[userIndex] = updated;
    return updated;
  }

  async findByProviderId(providerId: string): Promise<User | null> {
    const user = this.users.find(u => u.providerId === providerId);
    return user || null;
  }

  async updateEmailVerification(id: string, verified: boolean): Promise<void> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.emailVerified = verified;
      user.emailCode = null;
      user.emailCodeExpires = null;
      user.emailCodeCooldownExpires = null;
    }
  }

  async setEmailCode(id: string, code: string, expiresAt: Date, cooldownExpiresAt: Date): Promise<void> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.emailCode = code;
      user.emailCodeExpires = expiresAt;
      user.emailCodeCooldownExpires = cooldownExpiresAt;
    }
  }

  async findByEmailCode(code: string): Promise<User | null> {
    const user = this.users.find(u => u.emailCode === code && u.emailCodeExpires && u.emailCodeExpires > new Date());
    return user || null;
  }
}
