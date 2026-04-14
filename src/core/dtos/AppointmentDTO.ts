export interface AppointmentDTO {
  id: string;
  clientId?: string | null;
  customerId: string;
  client: string;
  clientTelephone?: string;
  barberId: string;
  barber: string;
  serviceId: string;
  service: string;
  timeId?: string | null;
  time: Date;
  price: number;
  status: string;
}
