
import { NextFunction, Request, RequestHandler, Response } from "express";
import createHttpError from "http-errors";

export const asyncWrapper = (requestHandler: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      if (err instanceof Error) {
        return next(createHttpError(500, err.message));
      }
      return next(createHttpError(500, "Internal server error"));
    });
  };
};


export function mapToObject(map: Map<string, any>) {
    const obj = {};
    for (const [key, value] of map) {
        // todo: fix this type error
        // @ts-ignore
        obj[key] = value instanceof Map ? mapToObject(value) : value;
    }
    return obj;
}