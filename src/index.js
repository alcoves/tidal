const segmenting = require('./handlers/segmenting');
const concatinating = require('./handlers/concatinating');

const { TIDAL_MODULE } = process.env;

if (TIDAL_MODULE === 'segmenting') segmenting();
if (TIDAL_MODULE === 'concatinating') concatinating();
