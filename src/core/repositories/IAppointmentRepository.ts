import { AppointmentDTO } from '../dtos/AppointmentDTO';
import { BarberCompletedAppointmentDTO } from '../dtos/BarberCompletedAppointmentDTO';
import { Appointment } from '../entities/Appointment';

export type AppointmentCancelOrigin = "CLIENT" | "BARBER";

export interface CreateAppointmentRepositoryDTO {
  barberId: string;
  serviceId: string;
  serviceIds: string[];
  startAt: Date;
  customerId?: string;
  clientId?: string | null;
  price?: number;
  totalDuration?: number;
  totalPrice?: number;
  serviceNames?: string[];
  serviceDurations?: number[];
}

export interface PaginatedAppointments {
  data: AppointmentDTO[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IAppointmentsRepository {
  create(data: CreateAppointmentRepositoryDTO): Promise<Appointment>;
  findByClientId(id: string, page?: number, limit?: number): Promise<PaginatedAppointments>;
  findByCustomerId(id: string): Promise<AppointmentDTO[] | null>;
  findById(id: string): Promise<AppointmentDTO | null>;
  findByBarberIdToday(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]>;
  findByBarberIdRange(barberId: string, startDate: Date, endDate: Date, serviceId?: string): Promise<AppointmentDTO[]>;
  findScheduledByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]>;
  findCompletedByBarberIdRange(barberId: string, startDate: Date, endDate: Date, serviceId?: string): Promise<BarberCompletedAppointmentDTO[]>;
  countByClientSince(clientId: string, since: Date): Promise<number>;
  countCompletedByBarberToday(barberId: string, date: Date): Promise<number>;
  attend(id: string): Promise<boolean>;
  canceled(id: string, canceledBy?: AppointmentCancelOrigin): Promise<void>;
}
