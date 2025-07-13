const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

// إعداد بوت تيليجرام
const TELEGRAM_TOKEN = '7277157537:AAFNn75vKddw_zuZo1ljJ0r5SASyuheJRCs';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// تحميل الأوامر
const whatsappCommands = {};
const commandFiles = fs.readdirSync(path.join(__dirname, 'whatsapp_commands'));
for (const file of commandFiles) {
  const command = require(`./whatsapp_commands/${file}`);
  whatsappCommands[command.name] = command.run;
}

let sock; // الجلسة العالمية للبوت

// وظيفة تشغيل بوت واتساب
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        startBot();
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const command = body.split(' ')[0].toLowerCase();

    if (whatsappCommands[command]) {
      await whatsappCommands[command](sock, msg);
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ أمر غير معروف، اكتب `.help` للاطلاع على الأوامر.' });
    }
  });
}

// استقبال الرقم في تيليجرام وتوليد الرمز
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

    // بعد ظهور الرمز، شغل البوت
    startBot();

  } catch (err) {
    console.error('API Error:', err.message);
    bot.sendMessage(chatId, '⚠️ حدث خطأ أثناء جلب الرمز.');
  }
});
