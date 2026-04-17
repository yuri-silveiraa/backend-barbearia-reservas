import { CreateManualAppointmentDTO } from "../dtos/CreateManualAppointmentDTO";
import { Appointment } from "../entities/Appointment";
import { AppError } from "../errors/AppError";
import { ClientScheduleSpacingError } from "../errors/ClientScheduleSpacingError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { ICustomerRepository } from "../repositories/ICustomerRepository";
import { assertCustomerName, assertWhatsapp } from "../utils/customerInput";

export class CreateManualAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private barberRepository: IBarbersRepository,
    private customerRepository: ICustomerRepository,
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
    if (customer.blockedAt) {
      throw new AppError("Cliente bloqueado para novos agendamentos", 403);
    }

    const startAt = new Date(data.startAt);
    if (Number.isNaN(startAt.getTime())) {
      throw new AppError("Horário inválido", 400);
    }

    const existingAppointments = await this.appointmentRepository.findByCustomerId(customer.id);
    for (const appointment of existingAppointments ?? []) {
      if (appointment.status !== "SCHEDULED") continue;
      const diff = Math.abs(appointment.time.getTime() - startAt.getTime());
      if (diff < 5 * 24 * 60 * 60 * 1000) {
        throw new ClientScheduleSpacingError();
      }
    }

    return await this.appointmentRepository.create({
      barberId: barber.id,
      serviceId: data.serviceId,
      serviceIds: [data.serviceId],
      startAt,
      customerId: customer.id,
      clientId: null,
    });
  }
}
