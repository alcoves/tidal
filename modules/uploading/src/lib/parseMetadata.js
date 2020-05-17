module.exports = (metadata) => {
  return JSON.parse(metadata).streams.reduce((acc, { width, height }) => {
    if (width) acc.width = parseInt(width);
    if (height) acc.height = parseInt(height);
    return acc;
  }, {});
};
