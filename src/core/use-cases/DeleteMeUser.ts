import { NoAuthorizationError } from "../errors/NoAuthorizationError";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";
import { IUserRepository } from "../repositories/IUserRepository";

export class DeleteMeUser {
  constructor(
    private usersRepository: IUserRepository,
    private clientsRepository: IClientsRepository,
    private appointmentsRepository: IAppointmentsRepository,
    private timeRepository: ITimeRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new UserNotFoundError();

    if (user.type !== "CLIENT") {
      throw new NoAuthorizationError();
    }

    const client = await this.clientsRepository.findByUserId(userId);
    if (client) {
      const appointments = await this.appointmentsRepository.findByClientId(client.id);
      for (const appointment of appointments) {
        if (appointment.status === "SCHEDULED") {
          await this.appointmentsRepository.canceled(appointment.id);
          if (appointment.timeId) {
            await this.timeRepository.updateDisponible(appointment.timeId, true);
          }
        }
      }
    }

    const anonymizedEmail = `deleted+${user.id}@example.invalid`;
    await this.usersRepository.update(userId, {
      name: "Usuario excluido",
      email: anonymizedEmail,
      telephone: `REMOVIDO+${user.id}`,
      password: null,
      provider: null,
      providerId: null,
      emailVerified: false,
      emailCode: null,
      emailCodeExpires: null,
    });
  }
}
