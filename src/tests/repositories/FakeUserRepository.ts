import { User } from "@prisma/client";
import { IUserRepository } from "../../core/repositories/IUserRepository";


export class FakeUsersRepository implements IUserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async create(data: Omit<User, "id" >): Promise<User> {
    const newUser: User = {
      id: String(this.users.length + 1),
      ...data,
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
}