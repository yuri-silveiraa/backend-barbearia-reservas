import { Customer } from "../../../core/entities/Customer";
import { AppError } from "../../../core/errors/AppError";
import { FindOrCreateCustomerDTO, ICustomerRepository, ListedCustomerDTO } from "../../../core/repositories/ICustomerRepository";
import { assertCustomerName, assertWhatsapp } from "../../../core/utils/customerInput";
import { prisma } from "../prisma/prismaClient";

export class PrismaCustomerRepository implements ICustomerRepository {
  async findOrCreateByWhatsapp(data: FindOrCreateCustomerDTO): Promise<Customer> {
    const name = assertCustomerName(data.name);
    const whatsapp = assertWhatsapp(data.whatsapp);

    const existing = await prisma.customer.findUnique({ where: { whatsapp } });
    if (existing) {
      if (existing.name !== name) {
        return await prisma.customer.update({
          where: { id: existing.id },
          data: { name },
        });
      }
      return existing;
    }

    return await prisma.customer.create({
      data: { name, whatsapp },
    });
  }

  async findOrCreateFromUser(userId: string): Promise<Customer> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const name = assertCustomerName(user.name);
    const whatsapp = assertWhatsapp(user.telephone);

    if (user.customer) {
      return await prisma.customer.update({
        where: { id: user.customer.id },
        data: { name, whatsapp },
      });
    }

    const byWhatsapp = await prisma.customer.findUnique({ where: { whatsapp } });
    if (byWhatsapp) {
      return await prisma.customer.update({
        where: { id: byWhatsapp.id },
        data: { name, userId: user.id },
      });
    }

    return await prisma.customer.create({
      data: { name, whatsapp, userId: user.id },
    });
  }

  async findById(id: string): Promise<Customer | null> {
    return await prisma.customer.findUnique({ where: { id } });
  }

  async listCustomers(): Promise<ListedCustomerDTO[]> {
    const customers = await prisma.customer.findMany({
      include: {
        user: { select: { email: true } },
        appointments: {
          select: {
            id: true,
            status: true,
            canceledBy: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      whatsapp: customer.whatsapp,
      userId: customer.userId,
      email: customer.user?.email ?? null,
      noShowCount: customer.appointments.filter(
        (appointment) => appointment.status === "CANCELED" && appointment.canceledBy === "BARBER"
      ).length,
      totalAppointments: customer.appointments.length,
      blockedAt: customer.blockedAt,
      blockedReason: customer.blockedReason,
      blockedByBarberId: customer.blockedByBarberId,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));
  }

  async block(id: string, barberId: string, reason?: string): Promise<Customer> {
    return await prisma.customer.update({
      where: { id },
      data: {
        blockedAt: new Date(),
        blockedByBarberId: barberId,
        blockedReason: reason?.trim() || null,
      },
    });
  }

  async unblock(id: string): Promise<Customer> {
    return await prisma.customer.update({
      where: { id },
      data: {
        blockedAt: null,
        blockedByBarberId: null,
        blockedReason: null,
      },
    });
  }
}
