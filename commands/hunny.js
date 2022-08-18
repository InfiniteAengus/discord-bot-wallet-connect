const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
require('dotenv').config();

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
        .setCustomId('balance')
        .setLabel('Check balance')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('connect')
        .setLabel('Connect your wallet')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({
      content: 'What do you want to do?',
      components: [row],
      ephemeral: true,
    });
  },
};
