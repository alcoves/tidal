const AWS = require('aws-sdk');
const ecs = new AWS.ECS({ region: 'us-east-1' });

module.exports = ({ BUCKET, VIDEO_ID, PRESET }) => {
  return ecs
    .runTask({
      cluster: 'tidal',
      launchType: 'FARGATE',
      taskDefinition: 'concatinating',
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: 'ENABLED',
          subnets: [
            'subnet-00bcc265',
            'subnet-11635158',
            'subnet-2c4a0701',
            'subnet-2c4a0701',
            'subnet-c7275c9c',
            'subnet-fd3a56f1',
          ],
          securityGroups: ['sg-0622eab50e3a625ba'],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: 'concatinating',
            environment: [
              {
                name: 'BUCKET',
                value: BUCKET,
              },
              {
                name: 'VIDEO_ID',
                value: VIDEO_ID,
              },
              {
                name: 'PRESET',
                value: PRESET,
              },
            ],
          },
        ],
      },
    })
    .promise();
};
