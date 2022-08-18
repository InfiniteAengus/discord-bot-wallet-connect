const client = require('..');
const { allowedUsers } = require('../config.json');
const {
  getWalletFromDiscordUser,
  getUserNameFromMessage,
  getAmountFromMessage,
  hashCode,
} = require('../utils/helper');

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  if (
    allowedUsers.findIndex((user) => user.id === interaction.user.id) === -1
  ) {
    return;
  }

  if (interaction.isButton()) {
    // hunny button
    switch (interaction.customId) {
      case 'tip':
        break;
      case 'connect':
      case 'balance':
        // eslint-disable-next-line no-case-declarations
        const command = client.commands.get(interaction.customId);
        if (!command) return;

        try {
          await interaction.deferReply({ ephemeral: true });
          await command.execute(interaction);
        } catch (error) {
          console.log(error);
          await interaction.editReply({
            content: '🤔 There was an error while executing this command',
            ephemeral: true,
          });
        }
        break;
      case 'tip-yes':
        try {
          await interaction.deferReply({ ephemeral: true });

          const userId = getUserNameFromMessage(interaction.message.content);
          const user = client.users.cache.find((u) => u.id === userId);
          const userTag = user.username + '#' + user.discriminator;
          const amount = getAmountFromMessage(interaction.message.content);

          const senderWallet = await getWalletFromDiscordUser(
            interaction.user.tag
          );
          const receiverWallet = await getWalletFromDiscordUser(userTag);
          const hashToken = hashCode(
            `${process.env.HASH_TOKEN}${senderWallet.toLowerCase()}`
          );

          const requestBody = {
            sender: senderWallet.toLowerCase(),
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
            await interaction.editReply({
              content: data.error.message,
              components: [],
              ephemeral: true,
            });
          } else {
            await interaction.editReply({ content: 'thinking...' });
            await interaction.channel.send({
              content: `<@${interaction.user.id}> sent **${amount} <:hunny:1009530635150430228> HUNNY** to <@${userId}>`,
              components: [],
            });
          }
        } catch (e) {
          console.log(e);
          await interaction.editReply({
            content: '❌ Cannot send <:hunny:1009530635150430228> **HUNNY**',
            components: [],
            ephemeral: true,
          });
        }
        break;
      case 'tip-no':
        try {
          await interaction.update({
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
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await interaction.deferReply({ ephemeral: true });
      await command.execute(interaction);
    } catch (error) {
      console.log(error);
      await interaction.editReply({
        content: '🤔 There was an error while executing this command',
        ephemeral: true,
      });
    }
  }
});
