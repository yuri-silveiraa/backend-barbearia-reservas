import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";
import { Appointment } from "../entities/Appointment";
import { ClientScheduleSpacingError } from "../errors/ClientScheduleSpacingError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";


export class CreateAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
    private timeRepository: ITimeRepository,
  ) {}

  async execute(data: CreateAppointmentDTO): Promise<Appointment> {
    const client = await this.clientRepository.findByUserId(data.clientId);
    data.clientId = client.id;

    const time = await this.timeRepository.findById(data.timeId);
    if (!time) {
      throw new Error("Horário não encontrado");
    }

    const existingAppointments = await this.appointmentRepository.findByClientId(data.clientId);
    if (existingAppointments && existingAppointments.length > 0) {
      const scheduledAppointments = existingAppointments.filter((appointment) => appointment.status === "SCHEDULED");
      if (scheduledAppointments.length > 0) {
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        for (const appointment of scheduledAppointments) {
          const scheduledTime = await this.timeRepository.findById(appointment.timeId);
          if (!scheduledTime) continue;
          const diff = Math.abs(scheduledTime.date.getTime() - time.date.getTime());
          if (diff < sevenDaysMs) {
            throw new ClientScheduleSpacingError();
          }
        }
      }
    }

    return await this.appointmentRepository.create(data);
  }
}
