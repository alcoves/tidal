// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (req, res) => {
  if (req.method === "GET") {
    // ask consul k/v for config
    return res.status(200).json({
      tmpDir: "/tmp",
      consulStatus: "up",
      nomadStatus: "up"
    })
  }

  res.status(405).end()
}
