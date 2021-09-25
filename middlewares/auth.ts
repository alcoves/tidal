
import { Request, Response, NextFunction } from "express"

export function auth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req?.headers["x-api-key"]
  if (apiKey !== process.env.TIDAL_API_KEY) {
    return res.sendStatus(401)
  }
  next()
}

export function localAuth(req: Request, res: Response, next: NextFunction) {
  const ra = req.socket.remoteAddress
  const matches = ["::1", "127.0.0.1", "::ffff:127.0.0.1"]
  if (matches.some(v => ra.includes(v))) return next()
  return res.sendStatus(401)
}
