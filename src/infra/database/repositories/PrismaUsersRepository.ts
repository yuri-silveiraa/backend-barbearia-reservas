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
        telephone: data.telephone,
      }
    });
    if (user.type == "CLIENT") {
      await prisma.client.create({
        data: {
          userId: user.id,
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
    const user = await prisma.user.findUnique({
      where: { id },
      include: { client: true, barber: true }
    });

    if (!user) return;

    await prisma.$transaction(async (tx) => {
      if (user.client) {
        await tx.appointment.deleteMany({
          where: { clientId: user.client.id },
        });
        await tx.client.delete({
          where: { id: user.client.id },
        });
      }

      if (user.barber) {
        await tx.appointment.deleteMany({
          where: { barberId: user.barber.id },
        });
        await tx.time.deleteMany({
          where: { barberId: user.barber.id },
        });

        const balance = await tx.balance.findUnique({
          where: { barberId: user.barber.id },
        });
        if (balance) {
          await tx.payment.deleteMany({
            where: { balanceId: balance.id },
          });
          await tx.balance.delete({
            where: { id: balance.id },
          });
        }

        await tx.barber.delete({
          where: { id: user.barber.id },
        });
      }

      await tx.user.delete({
        where: { id },
      });
    });
  }

  async getMe(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        client: true,
        barber: true,
      }
    });
  }

  async update(
    id: string,
    data: Partial<Pick<User, "name" | "email" | "telephone" | "password" | "provider" | "providerId" | "emailVerified" | "emailCode" | "emailCodeExpires">>
  ): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async findByProviderId(providerId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { providerId },
    });
  }

  async updateEmailVerification(id: string, verified: boolean): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { 
        emailVerified: verified,
        emailCode: null,
        emailCodeExpires: null,
        emailCodeCooldownExpires: null,
      },
    });
  }

  async setEmailCode(id: string, code: string, expiresAt: Date, cooldownExpiresAt: Date): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { 
        emailCode: code,
        emailCodeExpires: expiresAt,
        emailCodeCooldownExpires: cooldownExpiresAt,
      },
    });
  }

  async findByEmailCode(code: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: { 
        emailCode: code,
        emailCodeExpires: { gt: new Date() },
      },
    });
  }
}
