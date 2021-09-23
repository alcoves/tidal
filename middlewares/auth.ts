
import { Request, Response, NextFunction } from "express"

export async function tidalAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req?.headers["x-api-key"]
  if (apiKey !== process.env.TIDAL_API_KEY) {
    return res.sendStatus(401)
  }
  next()
}