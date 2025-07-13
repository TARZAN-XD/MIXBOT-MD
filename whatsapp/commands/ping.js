module.exports = function (sock) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (text === '.ping') {
      await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong from طرزان الواقدي' });
    }
  });
};
