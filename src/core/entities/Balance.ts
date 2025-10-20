export class Balance {
  constructor(
    public readonly id: string,
    public readonly barberId: string,
    public balance: number = 0
  ) {}
}
