job "uploads" {
  priority    = 1
  type        = "batch"
  datacenters = ["dc1"]

  # periodic {
  #   cron             = "*/1 * * * * *"
  #   prohibit_overlap = true
  # }

  task "uploads" {
    driver = "raw_exec"

    config {
      command = "/home/ubuntu/tidal/nomad/scripts/uploading.sh"

      args = [
        "sqs.us-east-1.amazonaws.com/594206825329/tidal-uploads-dev",
        "sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev"
      ]
    }
  }
}
