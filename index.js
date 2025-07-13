const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// ✅ ضع هنا توكن البوت الخاص بك من BotFather
const token = '7277157537:AAFNn75vKddw_zuZo1ljJ0r5SASyuheJRCs';

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // تحقق من صحة الرقم
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
    console.error('خطأ في الاتصال بالـ API:', err.message);
    bot.sendMessage(chatId, '⚠️ حدث خطأ أثناء جلب الرمز. حاول مرة أخرى لاحقًا.');
  }
});
