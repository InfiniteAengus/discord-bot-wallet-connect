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
    .setDescription('Tip HUNNY to users'),
  async execute(interaction) {
    const wallet = await getWalletFromDiscordUser(interaction.user.tag, interaction);

    if (!wallet) {
      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle('🤔 Please link your wallet with **/connect**')
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

    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    const receiverWallet = await getWalletFromDiscordUser(user.username + '#' + user.discriminator);

    if (!receiverWallet) {
      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle('🤔 This person has not linked their wallet yet.')
        .setDescription('Tell them to link their wallet with **/connect**')
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

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('tip-yes')
        .setLabel('Send it')
        .setEmoji('<:hunny:1009530635150430228>')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('tip-no')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary),
    );
    await interaction.editReply({
      content: `Ready to send <:hunny:1009530635150430228> **${amount} HUNNY** to ${user}?`,
      components: [row],
      ephemeral: true
    });
  },
};
