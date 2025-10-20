export class Payment {
  constructor(
    public readonly id: string,
    public readonly balanceId: string,
    public amount: number,
    public readonly createdAt: Date = new Date()
  ) {}
}
