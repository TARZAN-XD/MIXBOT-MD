module.exports = async function pingCommand(sock, m) {
  try {
    const msg = m.messages[0];
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (!body.startsWith('.ping')) return;

    await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' });
  } catch (err) {
    console.error('Ping Command Error:', err);
  }
};
