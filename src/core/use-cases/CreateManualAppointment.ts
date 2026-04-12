import { CreateManualAppointmentDTO } from "../dtos/CreateManualAppointmentDTO";
import { Appointment } from "../entities/Appointment";
import { AppError } from "../errors/AppError";
import { ClientScheduleSpacingError } from "../errors/ClientScheduleSpacingError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { ICustomerRepository } from "../repositories/ICustomerRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";
import { assertCustomerName, assertWhatsapp } from "../utils/customerInput";

export class CreateManualAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private barberRepository: IBarbersRepository,
    private customerRepository: ICustomerRepository,
    private timeRepository: ITimeRepository,
  ) {}

  async execute(data: CreateManualAppointmentDTO): Promise<Appointment> {
    const barber = await this.barberRepository.findByUserId(data.barberUserId);
    if (!barber || !barber.isActive) {
      throw new AppError("Barbeiro não encontrado", 404);
    }

    const customer = await this.customerRepository.findOrCreateByWhatsapp({
      name: assertCustomerName(data.customerName),
      whatsapp: assertWhatsapp(data.customerWhatsapp),
    });

    const time = await this.timeRepository.findById(data.timeId);
    if (!time) {
      throw new AppError("Horário não encontrado", 404);
    }
    if (time.barberId !== barber.id) {
      throw new AppError("Horário não pertence ao barbeiro autenticado", 403);
    }

    const existingAppointments = await this.appointmentRepository.findByCustomerId(customer.id);
    for (const appointment of existingAppointments ?? []) {
      if (appointment.status !== "SCHEDULED") continue;
      const scheduledTime = await this.timeRepository.findById(appointment.timeId);
      if (!scheduledTime) continue;
      const diff = Math.abs(scheduledTime.date.getTime() - time.date.getTime());
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        throw new ClientScheduleSpacingError();
      }
    }

    return await this.appointmentRepository.create({
      barberId: barber.id,
      serviceId: data.serviceId,
      timeId: data.timeId,
      customerId: customer.id,
      clientId: null,
    });
  }
}
