const fetch = require('node-fetch');

module.exports = {
  async getWalletFromDiscordUser(userName) {
    const wRes = await fetch(
      `${
        process.env.BACKEND_API_URL
      }/getWalletByDiscord?discord=${encodeURIComponent(userName)}`,
    );
    const wallet = await wRes.json();

    if (!wallet.length) {
      return null;
    }

    return wallet[0].wallet;
  },
};
