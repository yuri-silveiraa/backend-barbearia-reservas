export interface GenerateTimeSlotsDTO {
  startTime: string;
  endTime: string;
  blockDuration: number;
  intervalStart?: string;
  intervalDuration?: number;
  startDate: string;
  endDate: string;
  excludeDays?: number[];
}

export interface TimeSlotValidationResult {
  isValid: boolean;
  error?: string;
  warning?: {
    message: string;
    options: Array<{
      start: string;
      end: string;
    }>;
  };
}

export interface TimeSlotDTO {
  id: string;
  date: Date;
  disponible: boolean;
}
