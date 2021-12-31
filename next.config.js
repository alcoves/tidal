/** @type {import('next').NextConfig} */

async function processJobs() {
  setInterval(() => {
    // console.log('Processing Jobs')
  }, 500)
}

processJobs()

module.exports = {
  reactStrictMode: true,
}
