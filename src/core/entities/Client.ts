export class Client {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public telephone: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
