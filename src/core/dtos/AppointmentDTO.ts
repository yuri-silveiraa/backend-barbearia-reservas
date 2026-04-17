export interface AppointmentDTO {
  id: string;
  clientId?: string | null;
  customerId: string;
  client: string;
  clientTelephone?: string;
  barberId: string;
  barber: string;
  barberTelephone?: string | null;
  serviceId: string;
  service: string;
  serviceNames?: string[];
  time: Date;
  endTime: Date;
  serviceDurationMinutes: number;
  serviceDurations?: number[];
  price: number;
  status: string;
  canceledBy?: "CLIENT" | "BARBER" | null;
}
