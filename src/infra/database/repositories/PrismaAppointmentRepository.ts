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
        clientId: true,
        barberId: true,
        serviceId: true,
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
    clientId: a.clientId,
    barberId: a.barberId,
    serviceId: a.serviceId,
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

  async findByBarberIdToday(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        time: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      select: {
        id: true,
        status: true,
        clientId: true,
        barberId: true,
        serviceId: true,
        client: {
          select: { 
            user: { select: { name: true } },
            telephone: true,
          }
        },
        barber: {
          select: { user: { select: { name: true } } }
        },
        service: {
          select: { name: true, price: true }
        },
        time: {
          select: { date: true }
        },
      },
      orderBy: {
        time: {
          date: 'asc',
        },
      },
    });

    return appointments.map((a) => ({
      id: a.id,
      clientId: a.clientId,
      barberId: a.barberId,
      serviceId: a.serviceId,
      client: a.client.user.name,
      barber: a.barber.user.name,
      service: a.service.name,
      time: a.time.date,
      status: a.status
    }));
  }

  async countCompletedByBarberToday(barberId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.appointment.count({
      where: {
        barberId,
        status: "COMPLETED",
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  async findById(id: string): Promise<AppointmentDTO | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        clientId: true,
        barberId: true,
        serviceId: true,
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
    if (!appointment) return null;
    
    const data = {
      id: appointment.id,
      clientId: appointment.clientId,
      barberId: appointment.barberId,
      serviceId: appointment.serviceId,
      client: appointment.client.user.name,
      barber: appointment.barber.user.name,
      service: appointment.service.name,
      time: appointment.time.date,
      status: appointment.status
    }
    return data;
  }

}