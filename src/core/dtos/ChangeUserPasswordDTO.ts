export interface ChangeUserPasswordDTO {
  userId: string;
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}
