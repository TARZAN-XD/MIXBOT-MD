const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { default: pino } = require('pino');
const path = require('path');
const handler = require('./handler');

module.exports = async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  handler.loadCommands(sock); // تحميل الأوامر

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log('🔁 إعادة الاتصال بواتساب...');
        startWhatsAppBot();
      } else {
        console.log('❌ تم تسجيل الخروج');
      }
    } else if (connection === 'open') {
      console.log('✅ تم الاتصال بواتساب بنجاح');
    }
  });
};
