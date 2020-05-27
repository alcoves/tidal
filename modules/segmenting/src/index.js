const AWS = require('aws-sdk');
const express = require('express');
const segment = require('./lib/segment');

const { Bucket, TIDAL_TABLE } = require('./config/config');

const port = 3000;
const app = express();

const s3 = new AWS.S3({ region: 'us-east-1' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const requests = [];
let processing = false;

app.post('/segments/:videoId/:segment', async (req, res) => {
  const { videoId, segment } = req.params;
  processing = true;
  requests.push(segment);

  await s3
    .upload({
      Bucket,
      Body: req,
      Key: `segments/source/${videoId}/${segment}`,
    })
    .promise();

  const { Items } = await db
    .query({
      TableName: TIDAL_TABLE,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': videoId },
    })
    .promise();

  await Promise.all(
    Items.map(({ preset }) => {
      return db
        .update({
          TableName: TIDAL_TABLE,
          Key: { id: videoId, preset },
          UpdateExpression: 'set #segments.#segName = :status',
          ExpressionAttributeNames: {
            '#segName': segment,
            '#segments': 'segments',
          },
          ExpressionAttributeValues: { ':status': false },
        })
        .promise();
    })
  );

  console.log(`express uploaded ${videoId}/${segment}`, Date.now());
  res.end();
  requests.pop();
});

module.exports.handler = async ({ videoId, filename }) => {
  const server = app.listen(port, () =>
    console.log(`http://127.0.0.1:${port}`)
  );

  try {
    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket,
      Key: `uploads/${videoId}/${filename}`,
    });

    await segment(signedUrl, videoId);

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (processing && !requests.length) {
          console.log('server is done processing');
          server.close(() => {
            clearInterval(interval);
            console.log('server is closed');
            resolve();
          });
        }
      }, 1000);
    });
  } catch (error) {
    console.error('catch error', error);
    server.close();
  }
};
