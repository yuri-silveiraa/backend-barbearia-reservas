import { AppointmentDTO } from '../dtos/AppointmentDTO';
import { Appointment } from '../entities/Appointment';

export interface IAppointmentsRepository {
  create(data: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<Appointment>;
  findByClientId(id: string): Promise<AppointmentDTO[] | null>;
  findById(id: string): Promise<AppointmentDTO | null>;
  countByClientSince(clientId: string, since: Date): Promise<number>;
  attend(id: string): Promise<void>;
  canceled(id: string): Promise<void>;
}