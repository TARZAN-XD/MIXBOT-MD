const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

// ✅ توكن تيليجرام
const tgToken = '7277157537:AAFNn75vKddw_zuZo1ljJ0r5SASyuheJRCs';
const bot = new TelegramBot(tgToken, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text || !/^\d{7,15}$/.test(text)) {
    return bot.sendMessage(chatId, `📲 *أرسل رقم واتساب مع رمز الدولة للحصول على رمز الاقتران*\n\nمثال: \`9665XXXXXXXX\``, {
      parse_mode: 'Markdown'
    });
  }

  await bot.sendMessage(chatId, '⏳ جارٍ التحقق من الرقم وجلب رمز الاقتران...');

  try {
    const response = await axios.get(`https://knight-bot-paircode.onrender.com/code?number=${text}`);
    const code = response.data?.code;

    if (!code || code === 'Service Unavailable') {
      return bot.sendMessage(chatId, '❌ الخدمة غير متوفرة الآن. حاول لاحقًا.');
    }

    await bot.sendMessage(chatId, `✅ *رمز الاقتران الخاص بك:*\n\n\`${code}\``, {
      parse_mode: 'Markdown'
    });
  } catch (err) {
    console.error('API Error:', err.message);
    bot.sendMessage(chatId, '⚠️ حدث خطأ أثناء جلب الرمز. حاول لاحقًا.');
  }
});

// ✅ تشغيل بوت واتساب تلقائيًا
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
      console.log('❌ الاتصال مغلق. إعادة الاتصال:', shouldReconnect);
      if (shouldReconnect) startWhatsApp();
    } else if (connection === 'open') {
      console.log('✅ واتساب متصل وجاهز!');
    }
  });

  // ✅ تحميل أوامر من مجلد whatsapp_commands
  const commandsPath = path.join(__dirname, 'whatsapp_commands');
  if (fs.existsSync(commandsPath)) {
    fs.readdirSync(commandsPath).forEach((file) => {
      if (file.endsWith('.js')) {
        const command = require(path.join(commandsPath, file));
        if (typeof command === 'function') {
          command(sock); // تمرير الجلسة لكل أمر
        }
      }
    });
  } else {
    console.warn('⚠️ مجلد whatsapp_commands غير موجود!');
  }
}

startWhatsApp();
