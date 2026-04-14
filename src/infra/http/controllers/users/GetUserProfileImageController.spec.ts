import { GetUserProfileImageController } from "./GetUserProfileImageController";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("GetUserProfileImageController", () => {
  it("retorna a imagem de perfil do usuario", async () => {
    const imageData = Buffer.from("fake-image");
    const usersRepository = {
      findById: jest.fn().mockResolvedValue({
        id: "user-1",
        profileImageData: imageData,
        profileImageMimeType: "image/png",
      }),
    };

    const controller = new GetUserProfileImageController(usersRepository as any);
    const req = mockRequest({ params: { id: "user-1" } });
    const res = mockResponse();

    await controller.handle(req, res);

    expect(usersRepository.findById).toHaveBeenCalledWith("user-1");
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/png");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(imageData);
  });

  it("retorna 404 quando o usuario nao tem imagem", async () => {
    const usersRepository = {
      findById: jest.fn().mockResolvedValue({
        id: "user-1",
        profileImageData: null,
        profileImageMimeType: null,
      }),
    };

    const controller = new GetUserProfileImageController(usersRepository as any);
    const req = mockRequest({ params: { id: "user-1" } });
    const res = mockResponse();

    await controller.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Imagem não encontrada" });
  });
});
