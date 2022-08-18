const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const fetch = require('node-fetch');
const {
  getWalletFromDiscordUser,
  hashCode,
} = require('../utils/helper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tip')
    .addUserOption((user) =>
      user.setName('user').setDescription('@user').setRequired(true)
    )
    .addIntegerOption((amount) =>
      amount.setName('amount').setDescription('amount').setRequired(true)
    )
    .setDescription('Tip HUNNY to users'),

  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    // Get Wallet of author
    const wallet = await getWalletFromDiscordUser(
      interaction.user.tag,
      interaction
    );

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

    // Get command argument values
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    // Get Receiver wallet address
    const receiverWallet = await getWalletFromDiscordUser(
      user.username + '#' + user.discriminator
    );

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

    // Noti if amount is not positive
    if (amount <= 0) {
      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle('🤔 The amount must be greater than 0.')
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
        .setStyle(ButtonStyle.Secondary)
    );

    interaction.editReply({
      content: `Ready to send <:hunny:1009530635150430228> **${amount} HUNNY** to ${user}?`,
      components: [row],
      ephemeral: true,
    }).then((m) => {
      const collector = m.createMessageComponentCollector();

      collector.on('collect', async (i) => {
        if (!i.isButton()) return;

        switch (i.customId) {
          case 'tip-yes':
            try {
              await i.deferUpdate({ ephemeral: true });

              const hashToken = hashCode(
                `${process.env.HASH_TOKEN}${wallet.toLowerCase()}`
              );

              const requestBody = {
                sender: wallet.toLowerCase(),
                receiver: receiverWallet.toLowerCase(),
                amount: amount,
                token: hashToken,
              };

              const res = await fetch(
                `${process.env.BACKEND_API_URL}/tipHunnyDiscord`,
                {
                  method: 'POST',
                  body: JSON.stringify(requestBody),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );

              const data = await res.json();
              if (data.error) {
                await i.editReply({
                  content: data.error.message,
                  components: [],
                  ephemeral: true,
                });
              } else {
                await i.editReply({ content: 'Sent <:hunny:1009530635150430228> **HUNNY**', components: [] });
                await i.channel.send({
                  content: `<@${i.user.id}> sent **${amount} <:hunny:1009530635150430228> HUNNY** to ${user}`,
                  components: [],
                });
              }
            } catch (e) {
              console.log(e);
              await i.editReply({
                content: '❌ Cannot send <:hunny:1009530635150430228> **HUNNY**',
                components: [],
                ephemeral: true,
              });
            }
            break;
          case 'tip-no':
            try {
              await i.update({
                content: '❌ Send cancelled',
                components: [],
              });
            } catch {
              console.log('error');
            }
            break;
          default:
            break;
        }
      });
    });
  },
};
