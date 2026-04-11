export interface CreateServiceDTO {
  name: string;
  price: number;
  description?: string;
  imageBase64?: string;
  imageMimeType?: string;
}
