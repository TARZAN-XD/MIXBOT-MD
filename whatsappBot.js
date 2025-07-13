const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

module.exports = async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Chrome (Tarzan WA)', 'Safari', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  // تحميل أوامر واتساب من المجلد
  const commandFolder = path.join(__dirname, 'whatsapp_commands');
  if (!fs.existsSync(commandFolder)) fs.mkdirSync(commandFolder);

  fs.readdirSync(commandFolder).forEach(file => {
    const command = require(`./whatsapp_commands/${file}`);
    if (typeof command === 'function') {
      sock.ev.on('messages.upsert', msg => command(sock, msg));
    }
  });

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== 401) {
        console.log('❌ الاتصال انقطع، إعادة المحاولة...');
        startWhatsAppBot();
      } else {
        console.log('🔒 تم تسجيل الخروج من واتساب');
      }
    } else if (connection === 'open') {
      console.log('✅ تم الاتصال بنجاح بواتساب!');
    }
  });
};
