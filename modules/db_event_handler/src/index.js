const AWS = require('aws-sdk');

const handleCompletion = require('./lib/handleCompletion');
const handleConcatination = require('./lib/handleConcatination');

module.exports.handler = async ({ Records }) => {
  for (const event of Records) {
    console.log(JSON.stringify(event));
    const oldImage = AWS.DynamoDB.Converter.unmarshall(event.dynamodb.OldImage);
    const newImage = AWS.DynamoDB.Converter.unmarshall(event.dynamodb.NewImage);

    if (Object.keys(oldImage).length && Object.keys(newImage).length) {
      await handleConcatination(oldImage, newImage);
      await handleCompletion(oldImage, newImage);
    }
  }
};
