import { ListServiceController } from "./ListServiceController";
import { ListService } from "../../../../core/use-cases/ListService";
import { mockResponse } from "../../../../tests/utils/MockExpress";

describe("ListServiceController", () => {
  it("deve listar todos os serviços", async () => {
    const mockListService = {
      execute: jest.fn().mockResolvedValue([
        {
          id: "1",
          name: "Corte Tradicional",
          description: "Corte masculino tradicional",
          price: 35,
        },
        {
          id: "2",
          name: "Barba Completa",
          description: "Modelagem e acabamento da barba",
          price: 30,
        },
      ]),
    };

    const controller = new ListServiceController(mockListService as any);

    const res = mockResponse();

    await controller.handle(res);

    expect(mockListService.execute).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ nome: "Corte Tradicional" }),
      expect.objectContaining({ nome: "Barba Completa" }),
    ]));
  });

  it("deve retornar lista vazia se não houver serviços", async () => {
    const mockListService = {
      execute: jest.fn().mockResolvedValue([]),
    };

    const controller = new ListServiceController(mockListService as any);

    const res = mockResponse();

    await controller.handle(res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
