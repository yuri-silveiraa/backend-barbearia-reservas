import { AppointmentDTO } from "../../../core/dtos/AppointmentDTO";
import { Appointment } from "../../../core/entities/Appointment";
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

  async findByClientId(clientId: string): Promise<AppointmentDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: { clientId },
      select: {
        id: true,
        status: true,
        client: {
          select: { user: { select: { name: true } } }
        },
        barber: {
          select: { user: { select: { name: true } } }
        },
        service: {
          select: { name: true }
        },
        time: {
          select: { date: true }
        },
      }
  });

  return appointments.map((a) => ({
    id: a.id,
    client: a.client.user.name,
    barber: a.barber.user.name,
    service: a.service.name,
    time: a.time.date,
    status: a.status
  }));
}


  async countByClientSince(clientId: string, since: Date): Promise<number> {
    return await prisma.appointment.count({
      where: {
        clientId,
        status: "SCHEDULED",
        createdAt: {
          gte: since,
        },
      },
    });
  }
  
  async attend(id: string): Promise<void> {
    await prisma.appointment.update({
      where: { id },
      data: { status: "COMPLETED" },
    });
  }

  async canceled(id: string): Promise<void> {
    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELED" },
    });
  }

  async findById(id: string): Promise<AppointmentDTO | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        client: {
          select: { user: { select: { name: true } } }
        },
        barber: {
          select: { user: { select: { name: true } } }
        },
        service: {
          select: { name: true }
        },
        time: {
          select: { date: true }
        },
      }
    });
    const data = {
      id: appointment.id,
      client: appointment.client.user.name,
      barber: appointment.barber.user.name,
      service: appointment.service.name,
      time: appointment.time.date,
      status: appointment.status
    }
    return data;
  }

}