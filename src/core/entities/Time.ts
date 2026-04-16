export class Time {
  constructor(
    public readonly id: string,
    public readonly barberId: string,
    public startAt: Date,
    public endAt: Date,
    public breakStartAt?: Date | null,
    public breakEndAt?: Date | null,
  ) {}
}
