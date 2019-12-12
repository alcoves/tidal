const { exec } = require('child_process');

const streamingExec = cmd => {
  return new Promise((resolve, reject) => {
    const cmdStream = exec(cmd);
    cmdStream.stdout.on('data', console.log);
    cmdStream.stderr.on('data', console.error);
    cmdStream.on('exit', code => {
      code === 0 ? resolve(code) : reject(code);
    });
  });
};

(async () => {
  const testFileName = 'Big_Buck_Bunny_1080_10s_30MB.mp4';
  const ffmpegCommand = `ffmpeg -i ./data/source/${testFileName} -preset veryfast -y -vf yadif,format=yuv420p -c:v libx264 -crf 17 -bf 2 -c:a aac -q:a 1 -ac 2 -ar 48000 -use_editlist 0 -movflags +faststart ./data/export/${testFileName}`;
  await streamingExec(ffmpegCommand);
})();
