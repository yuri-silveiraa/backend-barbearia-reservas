export type UserType = "BARBER" | "CLIENT";

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string | null,
    public type: UserType,
    public telephone: string,
    public provider?: string,
    public providerId?: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
