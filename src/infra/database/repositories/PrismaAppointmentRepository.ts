import { AppointmentDTO } from "../../../core/dtos/AppointmentDTO";
import { Appointment } from "../../../core/entities/Appointment";
import { AppError } from "../../../core/errors/AppError";
import { CreateAppointmentRepositoryDTO, IAppointmentsRepository } from "../../../core/repositories/IAppointmentRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaAppointmentRepository implements IAppointmentsRepository {
  async create(data: CreateAppointmentRepositoryDTO): Promise<Appointment> {
    if (!data.customerId) {
      throw new AppError("Cliente do agendamento não informado", 400);
    }

    return await prisma.$transaction(async (tx) => {
      const [customer, service, barber, time] = await Promise.all([
        tx.customer.findUnique({ where: { id: data.customerId } }),
        tx.service.findUnique({ where: { id: data.serviceId } }),
        tx.barber.findUnique({
          where: { id: data.barberId },
          include: { user: { select: { name: true, telephone: true } } },
        }),
        tx.time.findUnique({ where: { id: data.timeId } }),
      ]);

      if (!customer) throw new AppError("Cliente não encontrado", 404);
      if (!service) throw new AppError("Serviço não encontrado", 404);
      if (!barber) throw new AppError("Barbeiro não encontrado", 404);
      if (!time) throw new AppError("Horário não encontrado", 404);

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
          clientId: data.clientId ?? null,
          customerId: data.customerId,
          serviceId: data.serviceId,
          timeId: data.timeId,
          price: service.price,
          customerName: customer.name,
          customerWhatsapp: customer.whatsapp,
          barberName: barber.user.name,
          barberWhatsapp: barber.user.telephone || null,
          serviceName: service.name,
          scheduledAt: time.date,
        },
      });
    });
  }

  async findByClientId(clientId: string): Promise<AppointmentDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: { clientId },
      select: appointmentSelect,
      orderBy: { scheduledAt: "asc" },
    });

    return appointments.map(toAppointmentDTO);
  }

  async findByCustomerId(customerId: string): Promise<AppointmentDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: { customerId },
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
  timeId: true,
  price: true,
  customerName: true,
  customerWhatsapp: true,
  barberName: true,
  barberWhatsapp: true,
  serviceName: true,
  scheduledAt: true,
} as const;

function toAppointmentDTO(appointment: {
  id: string;
  status: string;
  clientId: string | null;
  customerId: string;
  barberId: string;
  serviceId: string;
  timeId: string | null;
  price: number;
  customerName: string;
  customerWhatsapp: string;
  barberName: string;
  barberWhatsapp: string | null;
  serviceName: string;
  scheduledAt: Date;
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
    timeId: appointment.timeId,
    time: appointment.scheduledAt,
    price: appointment.price,
    status: appointment.status,
  };
}
