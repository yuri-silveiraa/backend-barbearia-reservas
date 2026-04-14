import { Barber } from "./Barber";
import { Client } from "./Client";

export type UserType = "BARBER" | "CLIENT";

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string | null,
    public type: UserType,
    public telephone: string,
    public provider?: string,
    public providerId?: string,
    public emailVerified: boolean = false,
    public emailCode?: string | null,
    public emailCodeExpires?: Date | null,
    public emailCodeCooldownExpires?: Date | null,
    public profileImageData?: Uint8Array<ArrayBuffer> | null,
    public profileImageMimeType?: string | null,
    public readonly createdAt: Date = new Date(),
    public barber?: Barber | null,
    public client?: Client | null
  ) {}
}
