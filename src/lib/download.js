const { exec } = require('child_process');

module.exports = async ({ Bucket, Key }, tmpDir) => {
  return new Promise((resolve, reject) => {
    const sourceName = 'source.mp4';
    const sourceFullPath = `${tmpDir}/${sourceName}`;
    console.log('downloading source file');
    exec(
      `aws s3 cp s3://${Bucket}/${Key} ${sourceFullPath}`,
      (error, stdout, stderr) => {
        if (error || stderr) reject(error || stderr);
        resolve(sourceFullPath);
      },
      { maxBuffer: 1024 * 1024 * 50 }
    );
  });
};
