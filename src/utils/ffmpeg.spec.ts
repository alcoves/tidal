import { createFFMpeg, parseFfmpegProgress, parseFfmpegTime } from './ffmpeg';

// describe('parseFfmpegProgress', () => {
//   it('should parse FFmpeg progress messages correctly', () => {
//     const stderr =
//       'frame=123 fps=25.0 time=00:00:05.00 bitrate=1024.0kb/s speed=1.23x progress=0.50';
//     const result = parseFfmpegProgress(stderr);

//     expect(result).toEqual({
//       frame: 123,
//       fps: 25.0,
//       time: { hours: 0, minutes: 0, seconds: 5, milliseconds: 0 },
//       bitrate: 1024.0,
//       speed: 1.23,
//       progress: 0.5,
//     });
//   });

//   it('should return null for invalid FFmpeg progress messages', () => {
//     const stderr = 'This is not a valid progress message';
//     const result = parseFfmpegProgress(stderr);

//     expect(result).toBeNull();
//   });
// });

// describe('parseFfmpegTime', () => {
//   it('should parse time strings in HH:MM:SS format correctly', () => {
//     const timeString = '01:23:45.67';
//     const result = parseFfmpegTime(timeString);
//     expect(result).toBeCloseTo(5025.67, 2);
//   });

//   it('should parse time strings in MM:SS format correctly', () => {
//     const timeString = '12:34.56';
//     const result = parseFfmpegTime(timeString);
//     expect(result).toBeCloseTo(754.56, 2);
//   });

//   it('should parse time strings in SS format correctly', () => {
//     const timeString = '56.78';
//     const result = parseFfmpegTime(timeString);
//     expect(result).toBeCloseTo(56.78, 2);
//   });
// });

// describe('createFFMpeg', () => {
//   test('calls onSuccess when ffmpeg process exits with code 0', (done) => {
//     const args = ['-i', 'input.mp4', 'output.mp4'];
//     const onProgress = jest.fn();
//     const onSuccess = jest.fn();
//     const onError = jest.fn();

//     const ffmpegProcess = createFFMpeg(args, onProgress, onSuccess, onError);

//     ffmpegProcess.on('close', (code: number) => {
//       expect(code).toBe(0);
//       expect(onProgress).toHaveBeenCalledTimes(1);
//       expect(onSuccess).toHaveBeenCalledTimes(1);
//       expect(onError).not.toHaveBeenCalled();
//       done();
//     });
//   });
// });
