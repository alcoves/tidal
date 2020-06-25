const axios = require('axios');

module.exports = function (job, Meta) {
  const nomadAddr = `172.31.87.53/v1/job/${job}/dispatch`;
  return axios.post(nomadAddr, { Meta });
};
