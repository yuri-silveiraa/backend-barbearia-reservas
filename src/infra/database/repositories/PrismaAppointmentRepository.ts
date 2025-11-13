import { Appointment, AppointmentStatus } from "../../../core/entities/Appointment";
import { IAppointmentsRepository } from "../../../core/repositories/IAppointmentRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaAppointmentRepository implements IAppointmentsRepository {
  async create(data: Omit<Appointment, "id" | "createdAt" | "status">): Promise<Appointment> {
      const appointment = await prisma.appointment.create({
        data: {
          barberId: data.barberId,
          clientId: data.clientId,
          serviceId: data.serviceId,
          timeId: data.timeId
        },
      });
      return appointment;
  }

  async findByClientId(id: string): Promise<Appointment[] | null> {
    return await prisma.appointment.findMany({
      where: { clientId: id },
    });
  }

  async countByClientSince(clientId: string, since: Date): Promise<number> {
    return await prisma.appointment.count({
      where: {
        clientId,
        createdAt: {
          gte: since,
        },
      },
    });
  }
  
  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    await prisma.appointment.update({
      where: { id },
      data: { status: status },
    });
  }

}