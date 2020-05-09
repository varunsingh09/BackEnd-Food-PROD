module.exports = {
  apps: [
    {
      name: "ikram.foodapp",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      script:
        "./start.sh client --name ikram.foodapp",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: '/home/varun/log/client.log',
    },
    {
      name: "nodeserver",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      script: "./start.sh server --name nodeserver",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      //exec_mode: "cluster"
      error_file: '/home/varun/log/server.log',
    },

  ],
};
