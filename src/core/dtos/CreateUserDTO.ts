export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  type: "CLIENT" | "BARBER";
  telephone: string;
}