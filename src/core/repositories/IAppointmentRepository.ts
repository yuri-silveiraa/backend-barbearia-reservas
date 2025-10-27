import { Appointment } from '../entities/Appointment';

export interface IAppointmentsRepository {
  create(data: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<Appointment>;
  findById(id: string): Promise<Appointment | null>;
  countByClientSince(clientId: string, since: Date): Promise<number>;
  updateStatus(id: string, status: string): Promise<void>;
}