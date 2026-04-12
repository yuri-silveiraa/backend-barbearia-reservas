import { Customer } from "../../../core/entities/Customer";
import { AppError } from "../../../core/errors/AppError";
import { FindOrCreateCustomerDTO, ICustomerRepository } from "../../../core/repositories/ICustomerRepository";
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
}
