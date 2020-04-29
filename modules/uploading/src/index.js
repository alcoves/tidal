const AWS = require("aws-sdk");
const ecs = new AWS.ECS({ region: "us-east-1" });

module.exports.handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  for (const { body } of event.Records) {
    const { Records } = JSON.parse(body);
    for (const { s3 } of Records) {
      const videoId = s3.object.key.split("/")[1];
      const filename = s3.object.key.split("/")[2];

      let transcodingQueueUrl;
      if (s3.bucket.name.includes("dev")) {
        transcodingQueueUrl =
          "https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev";
      } else {
        transcodingQueueUrl =
          "https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-prod";
      }

      const segmentCommands = [
        "segment",
        `--video_id=${videoId}`,
        `--filename=${filename}`,
        `--bucket_name=${s3.bucket.name}`,
        `--transcode_queue_url=${transcodingQueueUrl}`,
      ];

      await ecs
        .runTask({
          cluster: "tidal",
          launchType: "FARGATE",
          platformVersion: "1.4.0",
          taskDefinition: "segmenting",
          networkConfiguration: {
            awsvpcConfiguration: {
              assignPublicIp: "ENABLED",
              subnets: [
                "subnet-00bcc265",
                "subnet-11635158",
                "subnet-2c4a0701",
                "subnet-2c4a0701",
                "subnet-c7275c9c",
                "subnet-fd3a56f1",
              ],
              securityGroups: ["sg-0622eab50e3a625ba"],
            },
          },
          overrides: {
            containerOverrides: [
              {
                name: "segmenting",
                command: segmentCommands,
              },
            ],
          },
        })
        .promise();
    }
  }
};
