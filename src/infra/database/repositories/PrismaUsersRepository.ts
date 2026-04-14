import { User } from "../../../core/entities/User";
import { IUserRepository } from "../../../core/repositories/IUserRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaUsersRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }
  async create(data: Parameters<IUserRepository["create"]>[0]): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        type: data.type,
        telephone: data.telephone,
        emailVerified: data.emailVerified ?? false,
        emailCode: data.emailCode,
        emailCodeExpires: data.emailCodeExpires,
        emailCodeCooldownExpires: data.emailCodeCooldownExpires,
      }
    });
    if (user.type == "CLIENT") {
      await prisma.client.create({
        data: {
          userId: user.id,
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
        await tx.appointment.updateMany({
          where: { clientId: user.client.id },
          data: { clientId: null },
        });
        await tx.client.delete({
          where: { id: user.client.id },
        });
      }

      if (user.barber) {
        await tx.barber.update({
          where: { id: user.barber.id },
          data: { isActive: false },
        });
        await tx.time.deleteMany({
          where: { barberId: user.barber.id, appointments: { none: {} } },
        });
      }

      await tx.user.update({
        where: { id },
        data: {
          name: "Usuario excluido",
          email: `deleted+${id}@example.invalid`,
          telephone: "REMOVIDO",
          password: null,
          provider: null,
          providerId: null,
          emailVerified: false,
          emailCode: null,
          emailCodeExpires: null,
          emailCodeCooldownExpires: null,
          profileImageData: null,
          profileImageMimeType: null,
        },
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
    data: Partial<Pick<User, "name" | "email" | "telephone" | "password" | "provider" | "providerId" | "emailVerified" | "emailCode" | "emailCodeExpires" | "emailCodeCooldownExpires" | "profileImageData" | "profileImageMimeType">>
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
