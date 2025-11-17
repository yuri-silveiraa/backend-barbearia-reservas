export class Time {
  constructor(
    public readonly id: string,
    public readonly barberId: string,
    public date: Date,
    public disponible: boolean = true
  ) {}
}
