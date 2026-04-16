import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";
import { Appointment } from "../entities/Appointment";
import { AppError } from "../errors/AppError";
import { ClientScheduleSpacingError } from "../errors/ClientScheduleSpacingError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";
import { ICustomerRepository } from "../repositories/ICustomerRepository";
import { IServiceRepository } from "../repositories/IServiceRepository";

export class CreateAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
    private customerRepository: ICustomerRepository,
    private serviceRepository: IServiceRepository,
  ) {}

  async execute(data: CreateAppointmentDTO): Promise<Appointment> {
    const client = await this.clientRepository.findByUserId(data.clientId);
    if (!client) {
      throw new AppError("Cliente não encontrado", 404);
    }

    const customer = await this.customerRepository.findOrCreateFromUser(data.clientId);
    const startAt = new Date(data.startAt);
    if (Number.isNaN(startAt.getTime())) {
      throw new AppError("Horário inválido", 400);
    }

    if (!data.serviceIds || data.serviceIds.length === 0) {
      throw new AppError("Pelo menos um serviço deve ser selecionado", 400);
    }

    const services = await this.serviceRepository.findByIds(data.serviceIds);
    if (services.length !== data.serviceIds.length) {
      throw new AppError("Um ou mais serviços não encontrados", 404);
    }

    for (const service of services) {
      if (service.barberId !== data.barberId) {
        throw new AppError(`Serviço "${service.name}" não pertence ao barbeiro`, 400);
      }
    }

    const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const serviceNames = services.map(s => s.name);
    const serviceDurations = services.map(s => s.durationMinutes);

    const existingAppointments = await this.appointmentRepository.findByCustomerId(customer.id);
    if (existingAppointments && existingAppointments.length > 0) {
      const scheduledAppointments = existingAppointments.filter((appointment) => appointment.status === "SCHEDULED");
      if (scheduledAppointments.length > 0) {
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        for (const appointment of scheduledAppointments) {
          const diff = Math.abs(appointment.time.getTime() - startAt.getTime());
          if (diff < sevenDaysMs) {
            throw new ClientScheduleSpacingError();
          }
        }
      }
    }

    return await this.appointmentRepository.create({
      barberId: data.barberId,
      serviceId: data.serviceIds[0],
      serviceIds: data.serviceIds,
      startAt,
      clientId: client.id,
      customerId: customer.id,
      totalDuration,
      totalPrice,
      serviceNames,
      serviceDurations,
    });
  }
}
