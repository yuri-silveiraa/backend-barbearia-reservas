import { User } from "../../../core/entities/User";

type UserWithProfileImage = User & {
  profileImageData?: Uint8Array<ArrayBuffer> | null;
  profileImageMimeType?: string | null;
};

export function profileImageUrlFor(userId: string, hasImage?: boolean | null): string | null {
  return hasImage ? `/api/user/${userId}/profile-image?v=${Date.now()}` : null;
}

export function toUserResponse(user: UserWithProfileImage) {
  const {
    password,
    profileImageData,
    profileImageMimeType,
    ...userWithoutSensitiveData
  } = user as UserWithProfileImage & { password?: string };

  return {
    ...userWithoutSensitiveData,
    hasPassword: Boolean(password),
    profileImageUrl: profileImageUrlFor(user.id, Boolean(profileImageData && profileImageMimeType)),
  };
}
