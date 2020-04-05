const fs = require('fs-extra');
const concatinating = require('./concatinating');

jest.setTimeout(1000 * 60)

describe('concatinating', () => {
  beforeAll(async () => {
    await fs.remove('local')
    await fs.mkdir('local')
  })

  it('concatinates a video preset folder', async () => {
    const res = await concatinating({
      videoId: 'test',
      preset: 'libx264-720p',
      bucket: 'tidal-bken-dev',
    })
    expect(res).toEqual('done')
  })
})