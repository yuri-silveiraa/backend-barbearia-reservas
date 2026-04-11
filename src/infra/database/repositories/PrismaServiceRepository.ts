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
        imageData: data.imageData,
        imageMimeType: data.imageMimeType,
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
    const services = await prisma.service.findMany({
      where: { active: true },
    });
    return services;
  }

  async deleteById(id: string): Promise<void> {
    await prisma.service.update({
      where: { id },
      data: { active: false },
    });
  }

  async update(id: string, data: Partial<Service>): Promise<Service> {
    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageData !== undefined && { imageData: data.imageData }),
        ...(data.imageMimeType !== undefined && { imageMimeType: data.imageMimeType }),
      },
    });
    return service;
  }
  
}
