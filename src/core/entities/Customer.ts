export class Customer {
  constructor(
    public readonly id: string,
    public name: string,
    public whatsapp: string,
    public userId?: string | null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
}
