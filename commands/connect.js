const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const CryptoJS = require('crypto-js');
require('dotenv').config({ debug: process.env.DEBUG });
// const Web3 = require('web3');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect')
    .setDescription('Connect wallet'),
  async execute(interaction) {
    const ciphertext = CryptoJS.AES.encrypt(
      interaction.user.tag,
      process.env.BACKEND_API_TOKEN
    ).toString();
    console.log(interaction.token);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Connect Wallet')
        .setStyle(ButtonStyle.Link)
        .setURL(
          `${process.env.DAPP_URL}/connect?name=${encodeURIComponent(
            interaction.user.tag
          )}&id=${encodeURIComponent(
            interaction.user.id
          )}&token=${encodeURIComponent(ciphertext)}&i=${encodeURIComponent(
            interaction.token
          )}`
        )
    );
    await interaction.editReply({
      content: 'Link your wallet to start using <:hunny:1009530635150430228> **HUNNY**',
      components: [row],
      ephemeral: true,
      fetchReply: true,
    });
  },
};
