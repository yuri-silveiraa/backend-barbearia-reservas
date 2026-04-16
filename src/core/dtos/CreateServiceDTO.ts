export interface CreateServiceDTO {
  name: string;
  price: number;
  durationMinutes: number;
  description?: string;
  imageBase64?: string;
  imageMimeType?: string;
}
