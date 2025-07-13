const startTelegramBot = require('./telegram');
const startWhatsAppBot = require('./whatsapp/socket');

startTelegramBot(); // يبدأ بوت تيليجرام
startWhatsAppBot(); // يبدأ واتساب ويب
