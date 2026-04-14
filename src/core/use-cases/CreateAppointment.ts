import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";
import { Appointment } from "../entities/Appointment";
import { AppError } from "../errors/AppError";
import { ClientScheduleSpacingError } from "../errors/ClientScheduleSpacingError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";
import { ICustomerRepository } from "../repositories/ICustomerRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";

export class CreateAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
    private timeRepository: ITimeRepository,
    private customerRepository: ICustomerRepository,
  ) {}

  async execute(data: CreateAppointmentDTO): Promise<Appointment> {
    const client = await this.clientRepository.findByUserId(data.clientId);
    if (!client) {
      throw new AppError("Cliente não encontrado", 404);
    }

    const customer = await this.customerRepository.findOrCreateFromUser(data.clientId);
    const time = await this.timeRepository.findById(data.timeId);
    if (!time) {
      throw new AppError("Horário não encontrado", 404);
    }

    const existingAppointments = await this.appointmentRepository.findByCustomerId(customer.id);
    if (existingAppointments && existingAppointments.length > 0) {
      const scheduledAppointments = existingAppointments.filter((appointment) => appointment.status === "SCHEDULED");
      if (scheduledAppointments.length > 0) {
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        for (const appointment of scheduledAppointments) {
          if (!appointment.timeId) continue;
          const scheduledTime = await this.timeRepository.findById(appointment.timeId);
          if (!scheduledTime) continue;
          const diff = Math.abs(scheduledTime.date.getTime() - time.date.getTime());
          if (diff < sevenDaysMs) {
            throw new ClientScheduleSpacingError();
          }
        }
      }
    }

    return await this.appointmentRepository.create({
      barberId: data.barberId,
      serviceId: data.serviceId,
      timeId: data.timeId,
      clientId: client.id,
      customerId: customer.id,
    });
  }
}
