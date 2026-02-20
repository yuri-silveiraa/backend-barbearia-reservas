export interface AppointmentDTO {
  id: string;
  clientId: string;
  client: string;
  barberId: string;
  barber: string;
  serviceId: string;
  service: string;
  time: Date;
  status: string;
}