const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot('7277157537:AAFNn75vKddw_zuZo1ljJ0r5SASyuheJRCs', { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!/^\d{7,15}$/.test(text)) {
    return bot.sendMessage(chatId, `📲 *أرسل رقم واتساب مع رمز الدولة للحصول على رمز الاقتران*\n\nمثال: \`9665XXXXXXXX\``, {
      parse_mode: 'Markdown'
    });
  }

  await bot.sendMessage(chatId, '⏳ جارٍ التحقق من الرقم وجلب رمز الاقتران...');

  try {
    const res = await axios.get(`https://knight-bot-paircode.onrender.com/code?number=${text}`);
    const code = res.data?.code;

    if (!code || code === 'Service Unavailable') {
      return bot.sendMessage(chatId, '❌ الخدمة غير متوفرة الآن. حاول لاحقًا.');
    }

    await bot.sendMessage(chatId, `✅ *رمز الاقتران الخاص بك:*\n\n\`${code}\``, {
      parse_mode: 'Markdown'
    });
  } catch (err) {
    console.error('TelegramBot Error:', err);
    bot.sendMessage(chatId, '⚠️ حدث خطأ أثناء جلب الرمز. حاول لاحقًا.');
  }
});

module.exports = () => bot;
