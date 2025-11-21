import { AppointmentStatus } from "../entities/Appointment";

export interface AtendentAppointmentDTO {
  id: string;
  status: AppointmentStatus;
  userId: string;
}