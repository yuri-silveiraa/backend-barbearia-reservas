import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { AttendAppointmentDTO } from "../dtos/AttendAppointmentDTO";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";
import { IPaymentRepository } from "../repositories/IPaymentRepository";
import { IServiceRepository } from "../repositories/IServiceRepository";
import { IBalanceRepository } from "../repositories/IBalanceRepository";
import { AppError } from "../errors/AppError";

export class AttendAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private barberRepository: IBarbersRepository,
    private paymentRepository: IPaymentRepository,
    private serviceRepository: IServiceRepository,
    private balanceRepository: IBalanceRepository,
  ) {}

  async execute(data: AttendAppointmentDTO): Promise<void> {
    const barber = await this.barberRepository.findByUserId(data.userId);
    if (!barber)
      throw new NoAuthorizationError();
    
    const appointment = await this.appointmentRepository.findById(data.id);
    if (!appointment) {
      throw new AppError("Agendamento não encontrado", 404);
    }
    
    if(barber.id !== appointment.barberId)
      throw new NoAuthorizationError();

    if (appointment.status !== "SCHEDULED") {
      throw new AppError("Somente agendamentos marcados podem ser atendidos", 400);
    }

    const service = await this.serviceRepository.findById(appointment.serviceId);
    if (!service) {
      throw new AppError("Serviço não encontrado", 404);
    }

    const balance = await this.balanceRepository.findByBarberId(barber.id);
    if (!balance) {
      throw new AppError("Saldo do barbeiro não encontrado", 404);
    }
    
    const attended = await this.appointmentRepository.attend(data.id);
    if (!attended) {
      throw new AppError("Somente agendamentos marcados podem ser atendidos", 400);
    }

    await this.paymentRepository.create({amount: service.price, balanceId: balance.id});
    await this.balanceRepository.updateBalance(balance.id, balance.balance + service.price);
  }
}
