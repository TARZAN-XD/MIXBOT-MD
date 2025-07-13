module.exports = {
  name: '.help',
  run: async (sock, msg) => {
    const helpText = `
🧠 *أوامر طرزان الواقدي*:

• .ping - اختبار البوت
• .help - عرض هذه القائمة

📌 المزيد قريبًا...
    `;
    await sock.sendMessage(msg.key.remoteJid, { text: helpText });
  }
};
