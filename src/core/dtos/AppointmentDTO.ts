export interface AppointmentDTO {
  id: string;
  clientId: string;
  client: string;
  clientTelephone?: string;
  barberId: string;
  barber: string;
  serviceId: string;
  service: string;
  timeId: string;
  time: Date;
  price: number;
  status: string;
}
