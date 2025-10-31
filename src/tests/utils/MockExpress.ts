import { Request, Response } from "express";

export const mockRequest = (data?: Partial<Request>): Request => {
  return {
    body: data?.body || {},
    params: data?.params || {},
    query: data?.query || {},
    headers: data?.headers || {},
    ...data,
  } as Request;
};

export const mockResponse = (): Response => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn();

  return res;
};
