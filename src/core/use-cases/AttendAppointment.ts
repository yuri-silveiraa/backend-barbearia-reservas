import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { AttendAppointmentDTO } from "../dtos/AttendAppointmentDTO";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";
import { IPaymentRepository } from "../repositories/IPaymentRepository";
import { IServiceRepository } from "../repositories/IServiceRepository";
import { IBalanceRepository } from "../repositories/IBalanceRepository";

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
    const service = await this.serviceRepository.findById(appointment.serviceId);
    const balance = await this.balanceRepository.findByBarberId(barber.id);
    
    if(barber.id !== appointment.barberId)
      throw new NoAuthorizationError();
    
    await this.appointmentRepository.attend(data.id);
    await this.paymentRepository.create({amount: service.price, balanceId: balance.id});
    await this.balanceRepository.updateBalance(balance.id, balance.balance + service.price);
  }
}