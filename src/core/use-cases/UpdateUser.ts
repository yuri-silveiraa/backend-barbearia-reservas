import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { IUserRepository } from "../repositories/IUserRepository";
import { formatName, isNameValid } from "../utils/formatName";
import { AppError } from "../errors/AppError";

const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function decodeBase64Image(imageBase64: string): Uint8Array<ArrayBuffer> {
  const nodeBuffer = Buffer.from(imageBase64, "base64");
  const arrayBuffer = new ArrayBuffer(nodeBuffer.length);
  const bytes = new Uint8Array(arrayBuffer);
  bytes.set(nodeBuffer);
  return bytes;
}

export class UpdateUser {
  constructor(private usersRepository: IUserRepository) {}

  async execute(data: UpdateUserDTO) {
    const user = await this.usersRepository.findById(data.userId);
    if (!user) throw new UserNotFoundError();

    if (data.email && data.email !== user.email) {
      const existing = await this.usersRepository.findByEmail(data.email);
      if (existing && existing.id !== user.id) {
        throw new UserAlreadyExistsError(data.email);
      }
    }

    if (data.name && !isNameValid(data.name)) {
      throw new AppError("Nome deve conter apenas letras");
    }

    const hasProfileImagePayload = Boolean(data.profileImageBase64 || data.profileImageMimeType);
    if (hasProfileImagePayload && (!data.profileImageBase64 || !data.profileImageMimeType)) {
      throw new AppError("Imagem de perfil inválida");
    }

    if (data.profileImageMimeType && !ALLOWED_PROFILE_IMAGE_MIME_TYPES.includes(data.profileImageMimeType)) {
      throw new AppError("Formato de imagem inválido");
    }

    const profileImageData = data.profileImageBase64
      ? decodeBase64Image(data.profileImageBase64)
      : undefined;

    if (profileImageData && profileImageData.byteLength > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      throw new AppError("Imagem muito grande. Envie uma imagem de até 5MB.");
    }

    await this.usersRepository.update(data.userId, {
      name: data.name ? formatName(data.name) : user.name,
      email: data.email ?? user.email,
      telephone: data.telephone ?? user.telephone,
      ...(data.removeProfileImage
        ? { profileImageData: null, profileImageMimeType: null }
        : {}),
      ...(profileImageData
        ? {
            profileImageData,
            profileImageMimeType: data.profileImageMimeType,
          }
        : {}),
    });

    const updated = await this.usersRepository.getMe(data.userId);
    if (!updated) throw new UserNotFoundError();
    return updated;
  }
}
