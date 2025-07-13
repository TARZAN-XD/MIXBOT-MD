// ملف: index.js const TelegramBot = require('node-telegram-bot-api'); const axios = require('axios');

// توكن بوت تيليجرام الخاص بك const token = '7277157537:AAFNn75vKddw_zuZo1ljJ0r5SASyuheJRCs'; const bot = new TelegramBot(token, { polling: true });

bot.onText(//start/, (msg) => { bot.sendMessage(msg.chat.id, `👋 مرحبًا بك في بوت طرزان الواقدي!

أرسل رقم واتساب مع رمز الدولة للحصول على رمز الاقتران. مثال: 9665XXXXXXXX`, { parse_mode: 'Markdown' }); });

bot.on('message', async (msg) => { const chatId = msg.chat.id; const text = msg.text.trim();

if (text.startsWith('/')) return; // تجاهل الأوامر

const number = text.replace(/\D/g, '');

if (number.length < 8 || number.length > 15) { return bot.sendMessage(chatId, '❌ رقم غير صحيح. يرجى إرسال رقم واتساب مع رمز الدولة.'); }

bot.sendMessage(chatId, ⏳ جاري طلب رمز الاقتران للرقم: +${number});

try { const response = await axios.get(https://knight-bot-paircode.onrender.com/code?number=${number}); const code = response.data.code;

if (!code || code === "Service Unavailable") {
  return bot.sendMessage(chatId, '❌ الخدمة غير متوفرة حاليًا. حاول لاحقًا.');
}

bot.sendMessage(chatId, `✅ رمز الاقتران الخاص بك:

```${code}````, { parse_mode: 'Markdown' }); } catch (err) { console.error(err); bot.sendMessage(chatId, '🚫 حدث خطأ أثناء جلب رمز الاقتران. حاول لاحقًا.'); } });

