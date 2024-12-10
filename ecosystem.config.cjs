module.exports = {
  apps: [
    {
      name: "node-sftpd",
      exec_mode: "fork_mode", // "cluster",
      instances: "1",
      script: "./index.js", // your script
      // args: "start",
      env: {
        NODE_ENV: "prd", 
      },
    },
    {
      name: "node-ftp",
      exec_mode: "fork_mode", // "cluster",
      instances: "1",
      script: "./ftp.js", // your script
      env: {
        NODE_ENV: "prd", 
      },
    },
  ],
};