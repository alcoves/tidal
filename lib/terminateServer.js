const { exec } = require('child_process');

module.exports = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('terminating server');
    exec(`scripts/terminate.sh ${process.env.DO_API_KEY}`);
  } else {
    console.log('skipping server termination');
  }
};
