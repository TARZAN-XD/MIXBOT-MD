const fs = require('fs');
const path = require('path');

module.exports.loadCommands = function (sock) {
  const dir = path.join(__dirname, 'commands');
  fs.readdirSync(dir).forEach((file) => {
    if (file.endsWith('.js')) {
      const command = require(path.join(dir, file));
      if (typeof command === 'function') command(sock);
    }
  });
};
