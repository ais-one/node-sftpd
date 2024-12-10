module.exports = {
  apps: [
    {
      name: "sftpd2",
      exec_mode: "fork_mode", // "cluster",
      instances: "1",
      script: "./index.js", // your script
      // args: "start",
      env: {
        NODE_ENV: "prd", 
      },
    },
  ],
};