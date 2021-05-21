export default async (req, res) => {
  if (req.method === "POST") {
    req?.body?.map(({ Value }) => {
      const job = JSON.parse(Buffer.from(Value, 'base64').toString())
      console.log(`${job.id} was updated!`, job);

      // Fires when a job is first added
      if (states.segmenting.status === '') {
        // Begin segmentation
        // Begin audio processing
        // Begin thumbnail processing
        states.segmenting.status = 'running'
      } else if (states.segmenting.status === 'completed') { // Fires when a job has finished segmentation
        // Action: Begin transcoding all presets
      }

      // Fires when a job has finished transcoding a specific preset
      presets.map((p) => {
        if (p.segmentsTranscoded === job.totalSegments && !p.concatinationStarted) {
          // Action: Begin concatinating a specific preset
          p.concatinationStarted = true
        }
      })

      // Fires when all presets are concatinated
      if (allPresetsConcatinated && !cocatinationStarted) {
        concatinationStarted = true
        // Action: Package and publish
      }

      // Get hash of record and current record, if changed, update in consul
        // send current record to webhook address

    })

    // return res.status(200).send(job)
  }

  res.status(405).end()
}
