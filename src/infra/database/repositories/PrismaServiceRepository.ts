import { Service } from "../../../core/entities/Service";
import { IServiceRepository } from "../../../core/repositories/IServiceRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaServiceRepository implements IServiceRepository {
  async create(data: Omit<Service, "id">): Promise<Service> {
    const service = await prisma.service.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
      },
    });
    return service;
  }

  async findById(id: string): Promise<Service | null> {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    return service;
  }

  async findAll(): Promise<Service[]> {
    const services = await prisma.service.findMany();
    return services;
  }

  async deleteById(id: string): Promise<void> {
    await prisma.service.delete({
      where: { id },
    });
  }
  
}