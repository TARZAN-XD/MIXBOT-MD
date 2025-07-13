const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('🛑 الاتصال مغلق. إعادة الاتصال:', shouldReconnect);
      if (shouldReconnect) {
        startWhatsApp(); // إعادة التشغيل تلقائيًا
      }
    } else if (connection === 'open') {
      console.log('✅ تم الاتصال بواتساب بنجاح!');
    }
  });

  // ✅ تحميل أوامر من مجلد الأوامر
  const commandsPath = path.join(__dirname, 'whatsapp_commands');
  if (fs.existsSync(commandsPath)) {
    fs.readdirSync(commandsPath).forEach((file) => {
      if (file.endsWith('.js')) {
        const command = require(path.join(commandsPath, file));
        if (typeof command === 'function') {
          command(sock); // تمرير جلسة sock لكل أمر
        }
      }
    });
  } else {
    console.warn('⚠️ مجلد whatsapp_commands غير موجود!');
  }
}

startWhatsApp();
