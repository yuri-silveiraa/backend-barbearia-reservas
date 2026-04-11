import { AppointmentDTO } from "../../../core/dtos/AppointmentDTO";
import { Appointment } from "../../../core/entities/Appointment";
import { AppError } from "../../../core/errors/AppError";
import { CreateAppointmentRepositoryDTO, IAppointmentsRepository } from "../../../core/repositories/IAppointmentRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaAppointmentRepository implements IAppointmentsRepository {
  async create(data: CreateAppointmentRepositoryDTO): Promise<Appointment> {
    return await prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({
        where: { id: data.serviceId },
        select: { price: true },
      });

      if (!service) {
        throw new AppError("Serviço não encontrado", 404);
      }

      const reservedTime = await tx.time.updateMany({
        where: {
          id: data.timeId,
          barberId: data.barberId,
          disponible: true,
        },
        data: {
          disponible: false,
        },
      });

      if (reservedTime.count === 0) {
        throw new AppError("Horário indisponível para este barbeiro", 409);
      }

      return await tx.appointment.create({
        data: {
          barberId: data.barberId,
          clientId: data.clientId,
          serviceId: data.serviceId,
          timeId: data.timeId,
          price: service.price,
        },
      });
    });
  }

  async findByClientId(clientId: string): Promise<AppointmentDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: { clientId },
      select: appointmentSelect,
      orderBy: {
        time: { date: "asc" },
      },
    });

    return appointments.map(toAppointmentDTO);
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

  async attend(id: string): Promise<boolean> {
    const updated = await prisma.appointment.updateMany({
      where: {
        id,
        status: "SCHEDULED",
      },
      data: { status: "COMPLETED" },
    });

    return updated.count > 0;
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
      select: appointmentSelect,
      orderBy: {
        time: { date: "asc" },
      },
    });

    return appointments.map(toAppointmentDTO);
  }

  async findByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        time: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      select: appointmentSelect,
      orderBy: {
        time: { date: "asc" },
      },
    });

    return appointments.map(toAppointmentDTO);
  }

  async findCompletedByBarberIdRange(
    barberId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ id: string; serviceId: string; service: string; price: number; time: Date }>> {
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: "COMPLETED",
        time: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      select: {
        id: true,
        serviceId: true,
        price: true,
        service: { select: { name: true } },
        time: { select: { date: true } },
      },
      orderBy: {
        time: { date: "asc" },
      },
    });

    return appointments.map((appointment) => ({
      id: appointment.id,
      serviceId: appointment.serviceId,
      service: appointment.service.name,
      price: appointment.price,
      time: appointment.time.date,
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
      select: appointmentSelect,
    });

    return appointment ? toAppointmentDTO(appointment) : null;
  }
}

const appointmentSelect = {
  id: true,
  status: true,
  clientId: true,
  barberId: true,
  serviceId: true,
  timeId: true,
  price: true,
  client: {
    select: { user: { select: { name: true, telephone: true } } },
  },
  barber: {
    select: { user: { select: { name: true } } },
  },
  service: {
    select: { name: true },
  },
  time: {
    select: { date: true },
  },
} as const;

function toAppointmentDTO(appointment: {
  id: string;
  status: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  timeId: string;
  price: number;
  client: { user: { name: string; telephone?: string } };
  barber: { user: { name: string } };
  service: { name: string };
  time: { date: Date };
}): AppointmentDTO {
  return {
    id: appointment.id,
    clientId: appointment.clientId,
    barberId: appointment.barberId,
    serviceId: appointment.serviceId,
    client: appointment.client.user.name,
    clientTelephone: appointment.client.user.telephone,
    barber: appointment.barber.user.name,
    service: appointment.service.name,
    timeId: appointment.timeId,
    time: appointment.time.date,
    price: appointment.price,
    status: appointment.status,
  };
}
