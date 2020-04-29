const AWS = require("aws-sdk");
const ecs = new AWS.ECS({ region: "us-east-1" });

module.exports.handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  for (const { body } of event.Records) {
    const { Records } = JSON.parse(body);
    for (const { s3 } of Records) {
      const videoId = s3.object.key.split("/")[1];
      const filename = s3.object.key.split("/")[2];

      const signedUrl = await s3
        .getSignedUrlPromise("getObject", {
          Bucket: s3.bucket.name,
          Key: s3.object.key,
        })
        .promise();

      const commands = [
        "ffmpeg",
        "-i",
        `${signedUrl}`,
        "-c:v",
        "libx264",
        "-crf",
        "30",
        "-f",
        "mp4",
        "-movflags",
        "frag_keyframe+empty_moov",
        "-",
        "|",
        "aws",
        "s3",
        "cp",
        "-",
        `s3://tidal-bken-dev/transcoded/${videoId}/test.mp4`,
      ];

      await ecs
        .runTask({
          cluster: "tidal",
          launchType: "FARGATE",
          platformVersion: "1.4.0",
          taskDefinition: "pipeline",
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
                name: "pipeline",
                command: commands,
              },
            ],
          },
        })
        .promise();
    }
  }
};
