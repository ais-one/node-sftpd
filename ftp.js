const FtpSrv = require('ftp-srv');

const port=8005;
const ftpServer = new FtpSrv({
    url: "ftp://0.0.0.0:" + port,
    anonymous: true
});

ftpServer.on('login', ({ connection, username, password }, resolve, reject) => { 
    if(username === 'foo' && password === 'bar'){
        connection.on('RTER', (error, fileName) => {
          console.log('RTER', error)
        });
        connection.on('RNTO', (error, fileName) => {
          console.log('RNTO', error)
        });
        connection.on('STOR', (error, fileName) => {
          console.log('STOR', error)
        });
        return resolve({ root: "/root/node-sftpd" });
    }
    return reject(new errors.GeneralError('Invalid username or password', 401));
});

ftpServer.listen().then(() => { 
    console.log('Ftp server is starting...')
});