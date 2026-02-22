import { Request, Response } from "express";

interface MockRequestData extends Partial<Request> {
  user?: { id: string; barberId?: string; isAdmin?: boolean };
  cookies?: Record<string, string>;
}

export const mockRequest = (data?: MockRequestData): Request => {
  return {
    body: data?.body || {},
    params: data?.params || {},
    query: data?.query || {},
    headers: data?.headers || {},
    cookies: data?.cookies || {},
    user: data?.user,
    hostname: data?.hostname || "localhost",
    secure: data?.secure || false,
    ...data,
  } as Request;
};

export const mockResponse = (): Response => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn();
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);

  return res;
};
