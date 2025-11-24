export class Barber {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public isAdmin: boolean = false,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date()
  ) {}
}
