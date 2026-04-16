export interface GenerateTimeSlotsDTO {
  startTime: string;
  endTime: string;
  intervalStart?: string;
  intervalDuration?: number;
  startDate: string;
  endDate: string;
  selectedDates?: string[];
  excludeDays?: number[];
}

export interface TimeSlotValidationResult {
  isValid: boolean;
  error?: string;
}

export interface TimeSlotDTO {
  id: string;
  startAt: Date;
  endAt: Date;
  breakStartAt?: Date | null;
  breakEndAt?: Date | null;
}
