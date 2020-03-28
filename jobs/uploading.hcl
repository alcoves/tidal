job "uploads" {
  priority    = 1
  datacenters = ["dc1"]
  type        = "service"

  task "uploads_dev" {
    driver = "raw_exec"
    config {
      command = "node"
      args    = [
        "/home/ubuntu/tidal/src/uploading.js",
        "https://sqs.us-east-1.amazonaws.com/594206825329/tidal-uploads-dev",
        "https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev",
        "tidal-dev"
      ]
    }
  }

  // task "uploads_prod" {
  //   driver = "raw_exec"
  //   config {
  //     command = "node"
  //     args    = [
  //       "/home/ubuntu/tidal/src/uploading.js"
  //       "https://sqs.us-east-1.amazonaws.com/594206825329/tidal-uploads-dev"
  //     ]
  //   }
  // }
}
