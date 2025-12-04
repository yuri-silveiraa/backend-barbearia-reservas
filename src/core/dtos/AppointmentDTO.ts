export interface AppointmentDTO {
  id: string;
  client: string;
  barber: string;
  service: string;
  time: Date;
  status: string;
}