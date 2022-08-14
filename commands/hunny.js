const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
require('dotenv').config({ debug: process.env.DEBUG });
// const Web3 = require('web3');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hunny')
    .setDescription('Hunny Balance'),
  async execute(interaction) {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('tip')
        .setLabel('Tip')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('check-my-balance')
        .setLabel('Check balance')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('connect')
        .setLabel('Connect your wallet')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: 'What do you want to do?',
      components: [row],
      ephemeral: true,
    });
  },
};
