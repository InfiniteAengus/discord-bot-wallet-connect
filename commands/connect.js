const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
// const Web3 = require('web3');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect')
    .setDescription('Connect wallet'),
  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Connect Wallet')
        .setStyle(ButtonStyle.Link)
        .setURL('https://app.badbears.io/'),
    );

    await interaction.reply({
      content: 'Click the button below to connect your wallet',
      components: [row],
    });
  },
};
