const { timingSafeEqual } = require('crypto');
const { readFileSync } = require('fs');

const {
  Server,
  utils: {
    sftp: {
      OPEN_MODE,
      STATUS_CODE,
    },
  },
} = require('ssh2');

// ssh-keygen -m PEM -b 2048 -t ed25519
const keyName = 'keys/test';
const port = 8089;
const username = 'foo';
const password = 'bar';

const allowedUser = Buffer.from(username);
const allowedPassword = Buffer.from(password);

function checkValue(input, allowed) {
  const autoReject = (input.length !== allowed.length);
  if (autoReject) {
    // Prevent leaking length information by always making a comparison with the
    // same input when lengths don't match what we expect ...
    allowed = input;
  }
  const isMatch = timingSafeEqual(input, allowed);
  return (!autoReject && isMatch);
}

// This simple SFTP server implements file uploading where the contents get
// ignored ...

new Server({
  hostKeys: [readFileSync(keyName)] // mysftp, id_ed25519
}, (client) => {
  console.log('Client connected!');

  client.on('authentication', (ctx) => {
    let allowed = true;
    if (!checkValue(Buffer.from(ctx.username), allowedUser))
      allowed = false;

    switch (ctx.method) {
      case 'password':
        if (!checkValue(Buffer.from(ctx.password), allowedPassword))
          return ctx.reject();
        break;
      default:
        return ctx.reject();
    }

    if (allowed)
      ctx.accept();
    else
      ctx.reject();
  }).on('ready', () => {
    console.log('Client authenticated!');

    client.on('session', (accept, reject) => {
      const session = accept();
      session.on('sftp', (accept, reject) => {
        const openFiles = new Map();
        let handleCount = 0;
        const sftp = accept();
        sftp.on('OPEN', (reqid, filename, flags, attrs) => {
          // Only allow opening /tmp/foo.txt for writing
          // if (filename !== '/tmp/foo.txt' || !(flags & OPEN_MODE.WRITE))
          //   return sftp.status(reqid, STATUS_CODE.FAILURE);

          // Create a fake handle to return to the client, this could easily
          // be a real file descriptor number for example if actually opening
          // a file on disk
          const handle = Buffer.alloc(4);
          openFiles.set(handleCount, true);
          handle.writeUInt32BE(handleCount++, 0);
          // console.log('Opening file for write')
          sftp.handle(reqid, handle);
        }).on('REALPATH', (reqid, path) => {
          const names = [{
            // filename: '/tmp/foo.txt',
            // longname: '-rwxrwxrwx 1 foo foo 3 Dec 8 2009 foo.txt',
            attrs: {}
          }];
          console.log('path', path)
          return sftp.name(reqid, names)
          // return sftp.status(reqid, STATUS_CODE.OK);
        }).on('LSTAT', (reqid, path) => {
        }).on('WRITE', (reqid, handle, offset, data) => {
          console.log('data', typeof data, data.length, data.toString())
          if (handle.length !== 4 || !openFiles.has(handle.readUInt32BE(0))) {
            return sftp.status(reqid, STATUS_CODE.FAILURE);
          }
          // Fake the write operation
          sftp.status(reqid, STATUS_CODE.OK);
          // console.log('Write to file at offset ${offset}: ${inspect(data)}');
        }).on('CLOSE', (reqid, handle) => {
          let fnum;
          if (handle.length !== 4
              || !openFiles.has(fnum = handle.readUInt32BE(0))) {
            return sftp.status(reqid, STATUS_CODE.FAILURE);
          }
          // console.log('Closing file');
          openFiles.delete(fnum);
          sftp.status(reqid, STATUS_CODE.OK);
        });
      });
      session.on('end', () => {
        client.end();
      });
    });
  }).on('close', () => {
    console.log('Client disconnected');
  });
}).listen(port, '0.0.0.0', function() {
  console.log('Listening on port ' + this.address().port);
});