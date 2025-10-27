export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  type: "BARBER" | "CLIENT";
  telephone?: string;
}