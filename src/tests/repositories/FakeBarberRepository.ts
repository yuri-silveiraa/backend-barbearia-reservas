import { Barber } from "../../core/entities/Barber";
import { IBarbersRepository } from "../../core/repositories/IBarberRepository";
import { BarberDTO } from "../../core/dtos/BarberDTO";

export class FakeBarberRepository implements IBarbersRepository {
  private barbers: Barber[] = [];

  async findByUserId(userId: string): Promise<Barber | null> {
    const barber = this.barbers.find(b => b.userId === userId);
    return barber || null;
  }

  async create(data: { userId: string; isAdmin: boolean; name?: string; password?: string; type?: string; email?: string; telephone?: string }): Promise<Barber> {
    const barber: Barber = {
      id: String(this.barbers.length + 1),
      userId: data.userId,
      isAdmin: data.isAdmin,
      isActive: true,
      createdAt: new Date(),
    };
    this.barbers.push(barber);
    return barber;
  }

  async dismiss(barberId: string): Promise<void> {
    const barber = this.barbers.find(b => b.id === barberId);
    if (barber) {
      barber.isActive = false;
    }
  }

  async getAllBarbers(): Promise<BarberDTO[]> {
    return this.barbers
      .filter(b => b.isActive)
      .map(b => ({
        id: b.id,
        userId: b.userId,
        name: `User ${b.userId}`,
        email: `${b.userId}@example.com`,
        telephone: `+55${b.userId}`,
        profileImageUrl: null,
        isAdmin: b.isAdmin,
        isActive: b.isActive,
        createdAt: b.createdAt,
      }));
  }
}
