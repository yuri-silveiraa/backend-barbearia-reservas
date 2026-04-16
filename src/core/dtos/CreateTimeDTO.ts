export interface CreateTimeDTO {
  barberId: string;
  startAt: Date;
  endAt: Date;
  breakStartAt?: Date | null;
  breakEndAt?: Date | null;
}
