import { ffprobe } from './ffmpeg'

describe('ffprobe', () => {
  test('it returns metadata in the json format', async () => {
    const commands = '-v quiet -print_format json -show_format -show_streams ./data/test.mp4'
    const res = await ffprobe(commands)
    expect(res).toMatchSnapshot()
  })

  test('it returns metadata in the json format using cwd arg', async () => {
    const commands = '-v quiet -print_format json -show_format -show_streams test.mp4'
    const res = await ffprobe(commands, { cwd: './data' })
    expect(res).toMatchSnapshot()
  })
})
