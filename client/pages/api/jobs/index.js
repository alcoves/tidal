import axios from 'axios';

export default async (req, res) => {
  if (req.method === "GET") {
    const consulRes = await axios.get("http://localhost:8500/v1/kv/jobs/?recurse=true")
    const parsed = consulRes.data.map((d) => {
      return {
        ...d,
        Value: JSON.parse(new Buffer(d.Value, 'base64'))
      }
    })

    return res.status(200).send({
      jobs: parsed
    })
  }

  if (req.method === "POST") {
    // The job id is base64 encoded string of the source and destination
    if (!req.body.rcloneSource || !req.body.rcloneDest) {
      return res.status(400).send("req.body did not contain rcloneSource or rcloneDest")
    } 
    const jobId = Buffer.from(`${req.body.rcloneSource}-${req.body.rcloneDest}`).toString('base64');
    const job =  {
      id: jobId,
      status: 'setup',
      percentCompleted: 0,
      rcloneDest: req.body.rcloneDest,
      rcloneSource: req.body.rcloneSource,
    }

    // await axios.put("http://localhost:3000/api/segment", jobId)
    // await axios.put("http://localhost:3000/api/transcode", jobId)
    // await axios.put("http://localhost:3000/api/concatinate", jobId)
    // await axios.put("http://localhost:3000/api/package", jobId)

    // await axios.put(`http://localhost:8500/v1/kv/jobs/${jobId}`, job)
    // job.status = 'completed'
    await axios.put(`http://localhost:8500/v1/kv/jobs/${jobId}`, JSON.stringify(job, null, 2))
    // Create video transcode job
    // 1. Query video for metadata with ffmpeg in api
    // 2. API generates presets and ffmpeg commands
    // 3. Segment video job (wait)
    // 4. Transcode video segments (wait)
    // 5. Concatinate video segments
    // 6. Package video
    // 7. Webhook event
    return res.status(200).send(job)
  }

  res.status(405).end()
}
