export class Barber {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public isAdmin: boolean = false,
    public readonly createdAt: Date = new Date()
  ) {}
}
