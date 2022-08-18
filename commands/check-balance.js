const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { getWalletFromDiscordUser } = require('../utils/helper');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check HUNNY balance'),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    // Get Wallet address of author
    const wallet = await getWalletFromDiscordUser(
      interaction.user.tag,
      interaction
    );

    if (!wallet) {
      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle('Please link your wallet first')
        .setTimestamp()
        .setFooter({
          text: 'Powered by HUNNY',
          iconURL:
            'https://cdn.discordapp.com/icons/892863900352135248/a_47c3f1bc9ea8f18aa868723401f3c954.webp',
        });

      await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
      return;
    }

    // Fetch balance from backend
    const res = await fetch(
      `${process.env.BACKEND_API_URL}/getBalanceByWallet?ownerAddress=${wallet}`,
      {
        method: 'GET',
        headers: {
          Authorization: '8f5a202d-3cde-455d-8ac8-f306788c14f1',
        },
      }
    );
    const data = await res.json();

    // Embed Build
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('🍯 HUNNY Balance')
      .addFields({
        name: 'Balance',
        value: `You have **${data[0].hunnyBalance}** HUNNY available`,
      })
      .setTimestamp()
      .setFooter({
        text: 'Powered by HUNNY',
        iconURL:
          'https://cdn.discordapp.com/icons/892863900352135248/a_47c3f1bc9ea8f18aa868723401f3c954.webp',
      });

    // Reply
    await interaction.editReply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
