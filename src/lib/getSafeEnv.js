const result = require('dotenv').config({
  path: `${__dirname}/../../.env`,
});

if (result.error) throw result.error;
console.log('GLOBAL VARS', result.parsed);

module.exports = function getSafeEnv(envs) {
  for (const env of envs) {
    if (!result.parsed[env] || typeof result.parsed[env] === 'undefined') {
      throw new Error('global env is undefined');
    }
  }

  return result.parsed;
};
