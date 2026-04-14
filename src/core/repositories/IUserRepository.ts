import { User } from '../entities/User';

export interface IUserRepository {
  create(data: Omit<User, 'id' | 'createdAt' | 'emailVerified' | 'emailCode' | 'emailCodeExpires'> & { emailVerified?: boolean; emailCode?: string; emailCodeExpires?: Date; emailCodeCooldownExpires?: Date }): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByTelephone(telephone: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByProviderId(providerId: string): Promise<User | null>;
  deleteById(id: string): Promise<void>;
  getMe(id: string): Promise<User | null>;
  update(
    id: string,
    data: Partial<Pick<User, "name" | "email" | "telephone" | "password" | "provider" | "providerId" | "emailVerified" | "emailCode" | "emailCodeExpires" | "emailCodeCooldownExpires" | "profileImageData" | "profileImageMimeType">>
  ): Promise<User>;
  updateEmailVerification(id: string, verified: boolean): Promise<void>;
  setEmailCode(id: string, code: string, expiresAt: Date, cooldownExpiresAt: Date): Promise<void>;
  findByEmailCode(code: string): Promise<User | null>;
}
