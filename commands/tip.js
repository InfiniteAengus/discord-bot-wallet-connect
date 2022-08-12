const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const fetch = require('node-fetch');

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
      ephemeral: true,
    });
  },
};
