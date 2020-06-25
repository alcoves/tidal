const { handler } = require('./index');

describe('upload tests', () => {
  test('it processes a video', async () => {
    const event = {
      Records: [
        {
          messageId: '88eb16b3-e495-4e05-93a9-accce14b3141',
          receiptHandle:
            'AQEBUk9ep2sWaL+GeZd0acPjwj5aKJatYdR0BG6rUZybW6uWvxU2vGGKgIqex8X7S6kjYjaDOF7ZSy6+z2T6X+/8Cy4Up7t4M89XDwnq3Cjl5TcD72eXrMnhZgwtO58pzuy7sQPFMBNN7VLytJSdN+H9YuAj7TbMUxUCSG2VbplMk3JUb2x9lwmFZP9vhN54Rf8G7HVqV5eOQ+89aaajOhiVkOO15tgqSdirLH7rgr2NbLN/e9ZtwOZDqw22CRVqJ8gX/4RJSP75nq+3mBOm+5UlH9bAWVDEHu5MNR8lQ4kVrsFUqgSLRAhOfE9mN3BxNFhJREjxN0Nk8ATepRn51lIwwMJLoqILBsMAdvrGlcfoDJx+cBXYMH98t/FEHAWd5ZnYWexmvMraLizEVJjOPiY44g==',
          body: JSON.stringify({
            Records: [
              {
                eventVersion: '2.1',
                eventSource: 'aws:s3',
                awsRegion: 'us-east-1',
                eventTime: '2020-04-05T20:00:22.229Z',
                eventName: 'ObjectCreated:CompleteMultipartUpload',
                userIdentity: { principalId: 'A3DM7NBP99T08P' },
                requestParameters: { sourceIPAddress: '162.225.189.133' },
                responseElements: {
                  'x-amz-request-id': 'ABAE50409A2D8CA8',
                  'x-amz-id-2':
                    'Ax9m0UtW+6WcfDWipyeBF20lZQTu6RnUPPtsfZ1Xud6lNF0VrcTPUfeGSSDc39IHJZUSFG4ahHNHakjPahks8aDAN32Dn32CPGDdwMwH2GE=',
                },
                s3: {
                  s3SchemaVersion: '1.0',
                  configurationId: 'tf-s3-queue-20200326225308385000000001',
                  bucket: {
                    name: 'tidal-bken-dev',
                    ownerIdentity: { principalId: 'A3DM7NBP99T08P' },
                    arn: 'arn:aws:s3:::tidal-bken-dev',
                  },
                  object: {
                    key: 'uploads/test/source.mp4',
                    size: 18446809,
                    eTag: 'cb1c4a864d063b7b4bb96460c13e1392-2',
                    sequencer: '005E8A38D512AB2C26',
                  },
                },
              },
            ],
          }),
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: '1586116827408',
            SenderId: 'AIDAJHIPRHEMV73VRJEBU',
            ApproximateFirstReceiveTimestamp: '1586116852251',
          },
          messageAttributes: {},
          md5OfBody: 'bd7bafe409900a8b8e046da13b450914',
          eventSource: 'aws:sqs',
          eventSourceARN:
            'arn:aws:sqs:us-east-1:594206825329:tidal-uploads-dev',
          awsRegion: 'us-east-1',
        },
      ],
    };

    await handler(event);
  });
});
