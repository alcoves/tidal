module.exports = (string) => {
  return string.split('\n').reduce((acc, cv) => {
    const [key, value] = cv.split('=');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});
};
