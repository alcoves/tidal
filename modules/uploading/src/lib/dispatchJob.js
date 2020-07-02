const axios = require('axios');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

module.exports = async function (job, Meta) {
  const { Item } = await db
    .get({
      TableName: 'config',
      Key: { id: 'NOMAD_TOKEN' },
    })
    .promise();

  const nomadAddr = `http://10.0.3.87:4646/v1/job/${job}/dispatch`;
  return axios
    .post(
      nomadAddr,
      { Meta },
      {
        timeout: 1000 * 10,
        headers: {
          'X-Nomad-Token': Item.value,
        },
      }
    )
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
      throw new Error(error);
    });
};
