const axios = require('axios');

module.exports = function (job, Meta) {
  const nomadAddr = `http://172.31.29.153:4646/v1/job/${job}/dispatch`;
  return axios
    .post(nomadAddr, { Meta }, { timeout: 1000 * 10 })
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
      throw new Error(error);
    });
};
