import { Appointment } from '../../core/entities/Appointment';


export interface IAppointmentsRepository {
findById(id: string): Promise<any | null>;
countByClientSince(clientId: string, since: Date): Promise<number>;
createWithMarkTimeUnavailable(data: { barberId:string; clientId:string; serviceId:string; timeId:string }): Promise<any>;
completeAndCreatePaymentTransaction(appointmentId: string): Promise<any>;
}