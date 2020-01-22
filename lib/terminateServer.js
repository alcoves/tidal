const fs = require('fs-extra');
const upload = require('./upload');

const { exec } = require('child_process');

module.exports = async (videoId) => {
  try {
    if (videoId) {
      await Promise.all(
        ['combined.log', 'error.log'].map((path) => {
          return upload({
            ContentType: 'text/plain',
            Key: `videos/${videoId}/logs/${new Date().toISOString()}-${path}`,
            Body: fs.createReadStream(`./${path}`),
          });
        })
      );

      await fs.remove('./combined.log');
      await fs.remove('./error.log');
    }
  } catch (error) {
    console.error(error);
  }

  if (process.env.NODE_ENV === 'production') {
    exec(`scripts/terminate.sh ${process.env.DO_API_KEY}`);
  }
};
