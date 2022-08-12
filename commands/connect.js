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
    const ciphertext = CryptoJS.AES.encrypt(interaction.user.tag, process.env.BACKEND_API_TOKEN).toString();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Connect Wallet')
        .setStyle(ButtonStyle.Link)
        .setURL(`http://localhost:3000/connect?name=${encodeURIComponent(interaction.user.tag)}&token=${encodeURIComponent(ciphertext)}`),
    );

    await interaction.reply({
      content: 'Click the button below to connect your wallet',
      components: [row],
      ephemeral: true,
    });
  },
};