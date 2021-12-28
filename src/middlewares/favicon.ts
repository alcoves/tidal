import { Request, Response, NextFunction } from "express"

export async function favicon(req: Request, res: Response, next: NextFunction) {
  if (req.url.includes("favicon.ico")) {
    return res.sendStatus(200)
  }
  next()
}