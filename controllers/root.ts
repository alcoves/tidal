import { Request, Response } from "express"

export async function getRoot(req: Request, res: Response) {
  return res.sendStatus(200)
}