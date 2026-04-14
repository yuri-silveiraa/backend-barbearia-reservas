export interface UpdateUserDTO {
  userId: string;
  name?: string;
  email?: string;
  telephone?: string;
  profileImageBase64?: string;
  profileImageMimeType?: string;
  removeProfileImage?: boolean;
}
