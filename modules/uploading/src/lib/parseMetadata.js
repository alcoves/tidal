module.exports = (metadata) => {
  return JSON.parse(metadata).streams.reduce((acc, cv) => {
    if (cv.width) acc.width = parseInt(cv.width);
    if (cv.height) acc.height = parseInt(cv.height);
    if (cv.duration) acc.duration = parseFloat(cv.duration);
    return acc;
  }, {});
};
