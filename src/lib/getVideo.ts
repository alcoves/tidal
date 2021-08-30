import db from "../db/index"

export default async function getVideo(id: string): Promise<unknown> {
  const data = await db.query("select * from videos where id = $1", [id])
  return data.rows[0]
}