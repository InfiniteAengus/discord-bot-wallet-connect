const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config({ debug: process.env.DEBUG });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-my-balance')
    .setDescription('Check balance'),
  async execute(interaction) {
    const wRes = await fetch(
      `${
        process.env.BACKEND_API_URL
      }/getWalletByDiscord?discord=${encodeURIComponent(interaction.user.tag)}`,
    );
    const wallet = await wRes.json();

    if (!wallet.length) {
      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle('💎 Please connect your wallet first 💎')
        .setTimestamp()
        .setFooter({
          text: 'Powered by Bad Bears x BeeFrens',
          iconURL:
            'https://cdn.discordapp.com/icons/892863900352135248/a_47c3f1bc9ea8f18aa868723401f3c954.webp',
        });

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      return;
    }

    const res = await fetch(
      `${process.env.BACKEND_API_URL}/getBalanceByWallet?ownerAddress=${wallet[0].wallet}`,
      {
        method: 'GET',
        headers: {
          Authorization: '8f5a202d-3cde-455d-8ac8-f306788c14f1',
        },
      }
    );
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('💎 Check Your Balance 💎')
      .addFields({ name: 'Balance', value: `${data[0].hunnyBalance}` })
      .setTimestamp()
      .setFooter({
        text: 'Powered by Bad Bears x BeeFrens',
        iconURL:
          'https://cdn.discordapp.com/icons/892863900352135248/a_47c3f1bc9ea8f18aa868723401f3c954.webp',
      });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
