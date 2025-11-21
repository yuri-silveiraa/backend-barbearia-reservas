import { AppointmentStatus } from "../entities/Appointment";

export interface AttendAppointmentDTO {
  id: string;
  status: AppointmentStatus;
  userId: string;
}