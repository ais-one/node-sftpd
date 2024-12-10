// process.env.NODE_ENV = 'production'

const FtpSrv = require('ftp-srv');

const port=8005;
const ftpServer = new FtpSrv({
    url: "ftp://0.0.0.0:" + port,
    anonymous: false
});

ftpServer.on('login', ({ connection, username, password }, resolve, reject) => { 
    if(username === 'foo' && password === 'foo'){
        connection.on('RTER', (error, fileName) => console.log('RTER', error));
        connection.on('RNTO', (error, fileName) => console.log('RNTO', error));
        connection.on('STOR', (error, fileName) => console.log('STOR', error));
        // connection.on('RNFR', (error, fileName) => console.log('RNFR', error));
        connection.on('PORT', (error, fileName) => console.log('PORTXX', error));
        // connection.on('LIST', (error, fileName) => console.log('LIST', error));
        // connection.on('NLST', (error, fileName) => console.log('NLST', error));
        // connection.on('STAT', (error, fileName) => console.log('STAT', error));
        // connection.on('SIZE', (error, fileName) => console.log('SIZE', error));
        // connection.on('RNFR', (error, fileName) => console.log('RNFR', error));
        // connection.on('MDTM', (error, fileName) => console.log('MDTM', error));
        return resolve({ root: "/root/node-sftpd/data" });
    }
    // return reject(new errors.GeneralError('Invalid username or password', 401));
    return reject('Invalid username or password');
});

ftpServer.on('server-error', ({error}) => {
  console.log('vvvvvv->', error);
});
ftpServer.on('client-error', ({connection, context, error}) => {
  console.log('CLIETNERROR ->', error);
});

ftpServer.listen().then(() => { 
    console.log('Ftp server is starting...')
});