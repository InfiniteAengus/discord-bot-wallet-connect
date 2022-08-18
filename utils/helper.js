const fetch = require('node-fetch');

module.exports = {
  async getWalletFromDiscordUser(userName) {
    const wRes = await fetch(
      `${process.env.BACKEND_API_URL
      }/getWalletByDiscord?discord=${encodeURIComponent(userName)}`
    );
    const wallet = await wRes.json();

    if (!wallet.length) {
      return null;
    }

    return wallet[0].wallet;
  },

  getUserNameFromMessage(message) {
    let i = message.length - 1;
    for (; i >= 0; i--) {
      if (message[i] === '<') break;
    }

    return message.slice(i + 2, message.length - 2);
  },

  getAmountFromMessage(message) {
    const start = message.indexOf('**');
    let i;
    for (i = start; message[i] !== ' '; i++);
    return Number(message.slice(start + 2, i));
  },

  hashCode(str) {
    let hash = 0,
      i,
      chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash;
  },
};
