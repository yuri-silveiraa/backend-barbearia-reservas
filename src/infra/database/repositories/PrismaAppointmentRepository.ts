import { AppointmentDTO } from "../../../core/dtos/AppointmentDTO";
import { Appointment } from "../../../core/entities/Appointment";
import { AppError } from "../../../core/errors/AppError";
import { AppointmentCancelOrigin, CreateAppointmentRepositoryDTO, IAppointmentsRepository } from "../../../core/repositories/IAppointmentRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaAppointmentRepository implements IAppointmentsRepository {
  async create(data: CreateAppointmentRepositoryDTO): Promise<Appointment> {
    if (!data.customerId) {
      throw new AppError("Cliente do agendamento não informado", 400);
    }

    return await prisma.$transaction(async (tx) => {
      const [customer, barber] = await Promise.all([
        tx.customer.findUnique({ where: { id: data.customerId } }),
        tx.barber.findUnique({
          where: { id: data.barberId },
          include: { user: { select: { name: true, telephone: true } } },
        }),
      ]);

      if (!customer) throw new AppError("Cliente não encontrado", 404);
      if (!barber) throw new AppError("Barbeiro não encontrado", 404);

      const services = await tx.service.findMany({
        where: { id: { in: data.serviceIds } },
      });

      if (services.length !== data.serviceIds.length) {
        throw new AppError("Um ou mais serviços não encontrados", 404);
      }

      const totalDuration = data.totalDuration ?? services.reduce((sum, s) => sum + s.durationMinutes, 0);
      const totalPrice = data.totalPrice ?? services.reduce((sum, s) => sum + s.price, 0);
      const serviceNames = data.serviceNames ?? services.map(s => s.name);
      const serviceDurations = data.serviceDurations ?? services.map(s => s.durationMinutes);

      const scheduledEndAt = new Date(data.startAt.getTime() + totalDuration * 60 * 1000);

      const availability = await tx.time.findFirst({
        where: {
          barberId: data.barberId,
          startAt: { lte: data.startAt },
          endAt: { gte: scheduledEndAt },
        },
      });

      if (!availability) {
        throw new AppError("Horário indisponível para este barbeiro", 409);
      }

      if (
        availability.breakStartAt &&
        availability.breakEndAt &&
        data.startAt < availability.breakEndAt &&
        scheduledEndAt > availability.breakStartAt
      ) {
        throw new AppError("Horário indisponível para este barbeiro", 409);
      }

      const conflictingAppointment = await tx.appointment.findFirst({
        where: {
          barberId: data.barberId,
          status: "SCHEDULED",
          scheduledAt: { lt: scheduledEndAt },
          scheduledEndAt: { gt: data.startAt },
        },
      });

      if (conflictingAppointment) {
        throw new AppError("Horário indisponível para este barbeiro", 409);
      }

      return await tx.appointment.create({
        data: {
          barberId: data.barberId,
          clientId: data.clientId ?? null,
          customerId: data.customerId,
          serviceId: data.serviceIds[0],
          serviceIds: data.serviceIds,
          price: totalPrice,
          customerName: customer.name,
          customerWhatsapp: customer.whatsapp,
          barberName: barber.user.name,
          barberWhatsapp: barber.user.telephone || null,
          serviceName: serviceNames[0],
          serviceNames: serviceNames,
          scheduledAt: data.startAt,
          scheduledEndAt,
          serviceDurationMinutes: totalDuration,
          serviceDurations: serviceDurations,
        },
      });
    });
  }

  async findByClientId(clientId: string, page = 1, limit = 10): Promise<{ data: AppointmentDTO[], total: number, page: number, totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: { 
          clientId,
          status: { not: "CANCELED" }
        },
        select: appointmentSelect,
        orderBy: { scheduledAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.appointment.count({
        where: { 
          clientId,
          status: { not: "CANCELED" }
        }
      })
    ]);

    return {
      data: appointments.map(toAppointmentDTO),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCustomerId(customerId: string): Promise<AppointmentDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: { 
        customerId,
        status: { not: "CANCELED" }
      },
      select: appointmentSelect,
      orderBy: { scheduledAt: "asc" },
    });

    return appointments.map(toAppointmentDTO);
  }

  async countByClientSince(clientId: string, since: Date): Promise<number> {
    return await prisma.appointment.count({
      where: {
        clientId,
        status: "SCHEDULED",
        createdAt: { gte: since },
      },
    });
  }

  async attend(id: string): Promise<boolean> {
    const updated = await prisma.appointment.updateMany({
      where: { id, status: "SCHEDULED" },
      data: { status: "COMPLETED" },
    });

    return updated.count > 0;
  }

  async canceled(id: string, canceledBy: AppointmentCancelOrigin = "CLIENT"): Promise<void> {
    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELED", canceledBy },
    });
  }

  async findByBarberIdToday(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        scheduledAt: { gte: startDate, lt: endDate },
      },
      select: appointmentSelect,
      orderBy: { scheduledAt: "asc" },
    });

    return appointments.map(toAppointmentDTO);
  }

  async findByBarberIdRange(barberId: string, startDate: Date, endDate: Date, serviceId?: string): Promise<AppointmentDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        ...(serviceId && { serviceId }),
        scheduledAt: { gte: startDate, lte: endDate },
      },
      select: appointmentSelect,
      orderBy: { scheduledAt: "asc" },
    });

    return appointments.map(toAppointmentDTO);
  }

  async findScheduledByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: "SCHEDULED",
        scheduledAt: { lt: endDate },
        scheduledEndAt: { gt: startDate },
      },
      select: appointmentSelect,
      orderBy: { scheduledAt: "asc" },
    });

    return appointments.map(toAppointmentDTO);
  }

  async findCompletedByBarberIdRange(
    barberId: string,
    startDate: Date,
    endDate: Date,
    serviceId?: string
  ): Promise<Array<{ id: string; serviceId: string; service: string; price: number; time: Date }>> {
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        ...(serviceId && { serviceId }),
        status: "COMPLETED",
        scheduledAt: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        serviceId: true,
        serviceName: true,
        price: true,
        scheduledAt: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    return appointments.map((appointment) => ({
      id: appointment.id,
      serviceId: appointment.serviceId,
      service: appointment.serviceName,
      price: appointment.price,
      time: appointment.scheduledAt,
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
        scheduledAt: { gte: startOfDay, lte: endOfDay },
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
  customerId: true,
  barberId: true,
  serviceId: true,
  price: true,
  customerName: true,
  customerWhatsapp: true,
  barberName: true,
  barberWhatsapp: true,
  serviceName: true,
  serviceNames: true,
  scheduledAt: true,
  scheduledEndAt: true,
  serviceDurationMinutes: true,
  serviceDurations: true,
  canceledBy: true,
} as const;

function toAppointmentDTO(appointment: {
  id: string;
  status: string;
  clientId: string | null;
  customerId: string;
  barberId: string;
  serviceId: string;
  price: number;
  customerName: string;
  customerWhatsapp: string;
  barberName: string;
  barberWhatsapp: string | null;
  serviceName: string;
  serviceNames: string[];
  scheduledAt: Date;
  scheduledEndAt: Date;
  serviceDurationMinutes: number;
  serviceDurations: number[];
  canceledBy: "CLIENT" | "BARBER" | null;
}): AppointmentDTO {
  return {
    id: appointment.id,
    clientId: appointment.clientId,
    customerId: appointment.customerId,
    barberId: appointment.barberId,
    serviceId: appointment.serviceId,
    client: appointment.customerName,
    clientTelephone: appointment.customerWhatsapp,
    barber: appointment.barberName,
    barberTelephone: appointment.barberWhatsapp,
    service: appointment.serviceName,
    serviceNames: appointment.serviceNames?.length ? appointment.serviceNames : undefined,
    time: appointment.scheduledAt,
    endTime: appointment.scheduledEndAt,
    serviceDurationMinutes: appointment.serviceDurationMinutes,
    serviceDurations: appointment.serviceDurations?.length ? appointment.serviceDurations : undefined,
    price: appointment.price,
    status: appointment.status,
    canceledBy: appointment.canceledBy,
  };
}
