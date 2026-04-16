export class Service {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public barberId: string,
    public durationMinutes: number,
    public description?: string,
    public imageData?: Uint8Array<ArrayBuffer> | null,
    public imageMimeType?: string | null,
    public category?: string,
    public active?: boolean,
  ) {}
}
