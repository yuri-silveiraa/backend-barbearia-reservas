export class Service {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public description?: string,
  ) {}
}