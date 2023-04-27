import { spawn } from 'child_process';

interface FFprobeData {
  format: {
    filename: string;
    duration: number;
  };
  streams: {
    codec_type: string;
    width?: number;
    height?: number;
    bit_rate?: number;
    sample_rate?: number;
    channels?: number;
    duration?: number;
  }[];
}

export async function getMetadata(filePath: string): Promise<FFprobeData> {
  const args = [
    '-v',
    'quiet',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    filePath,
  ];

  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', args);
    let data = '';

    ffprobe.stdout.on('data', (chunk) => {
      data += chunk;
    });

    ffprobe.on('error', (error) => {
      reject(error);
    });

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`FFprobe exited with code ${code}`));
        return;
      }

      try {
        const result: FFprobeData = JSON.parse(data);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
}
