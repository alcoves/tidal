const { spawn } = require('child_process');

module.exports = function bash(arg) {
  const args = arg.split(' ');
  const command = args.shift();

  console.log({ args, command });

  return new Promise((resolve, reject) => {
    const cmd = spawn(command, args);

    cmd.stdout.on('data', (data) => {
      console.log(data);
    });

    cmd.stderr.on('data', (data) => {
      console.log(data);
    });

    cmd.on('error', (error) => {
      console.log(`error: ${error.message}`);
      reject(error);
    });

    cmd.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      code === 0 ? resolve(code) : reject(code);
    });
  });
};
