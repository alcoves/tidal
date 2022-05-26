import { checkDimensionContraints } from './video'

describe('video.test.ts', () => {
  const tests = [
    {
      skipped: true,
      r: { sourceWidth: 1920, sourceHeight: 1080, maxWidth: 1280, maxHeight: 720 },
    },
    {
      skipped: true,
      r: { sourceWidth: 1920, sourceHeight: 1080, maxWidth: 1920, maxHeight: 1080 },
    },
    {
      skipped: false,
      r: { sourceWidth: 1920, sourceHeight: 1080, maxWidth: 2560, maxHeight: 1440 },
    },
    {
      skipped: true,
      r: { sourceWidth: 0, sourceHeight: 1, maxWidth: 1, maxHeight: 1 },
    },
    {
      skipped: true,
      r: { sourceWidth: 1, sourceHeight: 0, maxWidth: 1, maxHeight: 1 },
    },
    {
      skipped: true,
      r: { sourceWidth: 1, sourceHeight: 0, maxWidth: 0, maxHeight: 1 },
    },
    {
      skipped: true,
      r: { sourceWidth: 0, sourceHeight: 0, maxWidth: 0, maxHeight: 0 },
    },
  ]

  test.each(tests)(
    'given source that is $r.sourceWidth by $r.sourceHeight, a preset that is $r.maxWidth by $r.maxHeight should be skipped: $skipped',
    ({ r, skipped }) => {
      const shouldSkip = checkDimensionContraints(r)
      expect(shouldSkip).toBe(skipped)
    }
  )
})
