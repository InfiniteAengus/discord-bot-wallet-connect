const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tip')
    .addUserOption((user) =>
      user.setName('user').setDescription('@user').setRequired(true)
    )
    .addNumberOption((amount) =>
      amount.setName('amount').setDescription('amount').setRequired(true)
    )
    .setDescription('Tip token to users'),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('yes')
        .setLabel('Yes')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('no')
        .setLabel('No')
        .setStyle(ButtonStyle.Danger)
    );
    await interaction.reply({
      content: `Are you sure to send ${amount} to ${user}?`,
      components: [row],
    });
  },
};
