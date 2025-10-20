export type UserType = "BARBER" | "CLIENT";

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string,
    public type: UserType,
    public readonly createdAt: Date = new Date()
  ) {}
}
