import { CreateUserDTO } from "../../../core/dtos/CreateUserDTO";
import { User } from "../../../core/entities/User";
import { IUserRepository } from "../../../core/repositories/IUserRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaUsersRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }
  async create(data: CreateUserDTO): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        type: data.type,
      }
    });
    if (user.type == "CLIENT") {
      await prisma.client.create({
        data: {
          userId: user.id,
          telephone: data.telephone,
        }
      });
    }
    if (user.type == "BARBER") {
      await prisma.barber.create({
        data: {
          userId: user.id,
        }
      });
      await prisma.balance.create({
        data: {
          barber: {
            connect: { userId: user.id }
          },
          balance: 0,
        }
      });
    }
    return user;
  }
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }
  async deleteById(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}