import { parseTimecodeFromSeconds } from './video'

describe('video.test.ts', () => {
  const tests = [
    {
      seconds: '0',
      timecode: '00:00:00.000',
    },
    {
      seconds: '10',
      timecode: '00:00:10.000',
    },
    {
      seconds: '11265',
      timecode: '03:07:45.000',
    },
    {
      seconds: '0.117',
      timecode: '00:00:00.117',
    },
    {
      seconds: '305.25',
      timecode: '00:05:05.250',
    },
  ]

  test.each(tests)('$seconds represets $timecode', ({ seconds, timecode }) => {
    expect(parseTimecodeFromSeconds(seconds)).toBe(timecode)
  })
})
