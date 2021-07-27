import { getPresets } from './getPresets';
import { Metadata } from './getMetadata';

describe('getPresets', () => {
  test('that presets are generated', () => {
    const metadata: Metadata = {
      width: 1920,
      height: 1080
    }
    expect(getPresets(metadata)).toMatchSnapshot();
  })
})