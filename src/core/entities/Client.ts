export class Client {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
