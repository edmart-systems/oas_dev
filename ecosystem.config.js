module.exports = {
  apps: [
    {
      name: "office_dev",
      script: "npx next dev -p 3765",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "office_prod",
      script: "npx next start -p 3765",
      watch: true,
      instances: "max",
      env: {
        NODE_ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
