const genManifest = require('./genManifest');

const genSegments = (length) => {
  const segments = [];
  for (let i = 0; i < length; i++) {
    segments.push(`segments/source/test/${i.toString().padStart(5, '0')}.mkv`);
  }
  return segments;
};

describe('manifest', () => {
  it('generates manifest', () => {
    const segments = genSegments(1);
    const manifest = genManifest(segments);
    expect(manifest).toMatchSnapshot();
  });

  it('generates manifest', () => {
    const segments = genSegments(2);
    const manifest = genManifest(segments);
    expect(manifest).toMatchSnapshot();
  });

  it('generates manifest', () => {
    const segments = genSegments(3);
    const manifest = genManifest(segments);
    expect(manifest).toMatchSnapshot();
  });

  it('generates manifest', () => {
    const segments = genSegments(4);
    const manifest = genManifest(segments);
    expect(manifest).toMatchSnapshot();
  });

  it('generates manifest', () => {
    const segments = genSegments(1250);
    const manifest = genManifest(segments);
    expect(manifest).toMatchSnapshot();
  });
});
