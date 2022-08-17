const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { getWalletFromDiscordUser } = require('../helper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tip')
    .addUserOption((user) =>
      user.setName('user').setDescription('@user').setRequired(true),
    )
    .addNumberOption((amount) =>
      amount.setName('amount').setDescription('amount').setRequired(true),
    )
    .setDescription('Tip token to users'),
  async execute(interaction) {
    const wallet = await getWalletFromDiscordUser(interaction.user.tag, interaction);

    if (!wallet) {
      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle('💎 Please connect your wallet first 💎')
        .setTimestamp()
        .setFooter({
          text: 'Powered by Bad Bears x BeeFrens',
          iconURL:
            'https://cdn.discordapp.com/icons/892863900352135248/a_47c3f1bc9ea8f18aa868723401f3c954.webp',
        });

      await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
      return;
    }

    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    const receiverWallet = await getWalletFromDiscordUser(user.username + '#' + user.discriminator);

    if (!receiverWallet) {
      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle('💎 Receiver haven\'t connected wallet yet 💎')
        .setTimestamp()
        .setFooter({
          text: 'Powered by Bad Bears x BeeFrens',
          iconURL:
            'https://cdn.discordapp.com/icons/892863900352135248/a_47c3f1bc9ea8f18aa868723401f3c954.webp',
        });

      await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
      return;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('tip-yes')
        .setLabel('Yes')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('tip-no')
        .setLabel('No')
        .setStyle(ButtonStyle.Danger),
    );
    await interaction.editReply({
      content: `Are you sure to send ${amount} to ${user}?`,
      components: [row],
      ephemeral: true
    });
  },
};
