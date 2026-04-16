export interface CreateAppointmentDTO {
  barberId: string;
  clientId: string;
  serviceIds: string[];
  startAt: string;
}
