import { AppointmentDTO } from '../dtos/AppointmentDTO';
import { BarberCompletedAppointmentDTO } from '../dtos/BarberCompletedAppointmentDTO';
import { Appointment } from '../entities/Appointment';

export interface CreateAppointmentRepositoryDTO {
  barberId: string;
  serviceId: string;
  timeId: string;
  customerId?: string;
  clientId?: string | null;
  price?: number;
}

export interface IAppointmentsRepository {
  create(data: CreateAppointmentRepositoryDTO): Promise<Appointment>;
  findByClientId(id: string): Promise<AppointmentDTO[] | null>;
  findByCustomerId(id: string): Promise<AppointmentDTO[] | null>;
  findById(id: string): Promise<AppointmentDTO | null>;
  findByBarberIdToday(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]>;
  findByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]>;
  findCompletedByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<BarberCompletedAppointmentDTO[]>;
  countByClientSince(clientId: string, since: Date): Promise<number>;
  countCompletedByBarberToday(barberId: string, date: Date): Promise<number>;
  attend(id: string): Promise<boolean>;
  canceled(id: string): Promise<void>;
}
