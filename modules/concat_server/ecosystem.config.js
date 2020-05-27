module.exports = {
  apps: [
    {
      name: 'concat',
      script: './src/index.js',
      watch: true,
      env: {
        PORT: 4000,
        NODE_ENV: 'development',
      },
      env_production: {
        PORT: 4000,
        NODE_ENV: 'production',
      },
    },
  ],
};
