export interface GenerateTimeSlotsDTO {
  startTime: string;
  endTime: string;
  blockDuration: number;
  intervalStart?: string;
  intervalDuration?: number;
  startDate: string;
  endDate: string;
  selectedDates?: string[];
  excludeDays?: number[];
  confirmRemainder?: boolean;
}

export interface TimeSlotValidationResult {
  isValid: boolean;
  error?: string;
  warning?: {
    message: string;
    remainderMinutes: number;
    lastBlockEnd: string;
  };
}

export interface TimeSlotDTO {
  id: string;
  date: Date;
  disponible: boolean;
}
