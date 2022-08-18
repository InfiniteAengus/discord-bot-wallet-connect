const fs = require('node:fs');
const path = require('node:path');
const Ably = require('ably');
const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
} = require('discord.js');
const fetch = require('node-fetch');
const { allowedUsers } = require('./config.json');
const {
  getWalletFromDiscordUser,
  getUserNameFromMessage,
  getAmountFromMessage,
  hashCode,
} = require('./helper');
require('dotenv').config({ debug: process.env.DEBUG });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  client.commands.set(command.data.name, command);
}

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
          interaction.deferReply();
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
            interaction.channel.send({
              content: `<@${interaction.user.id}> sent **${amount} <:hunny:1009530635150430228> HUNNY** to <@${userId}>`,
              components: [],
            });
            await interaction.deleteReply();
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

// Login to Discord with your client's token
const ably = new Ably.Realtime(process.env.ABLY_API_KEY);
const channel = ably.channels.get('discord-wallet');

channel.subscribe('wallet', async function (message) {
  try {
    const parsedData = message.data;
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    const role = guild.roles.cache.get('1009562726504345720');

    const member =
      guild.members.cache.get(parsedData.discordID) ||
      (await guild.members.fetch(parsedData.discordID).catch((error) => {
        console.log(error);
      }));

    await member.roles.add(role);

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('✨ Successfully linked wallet')
      .addFields({ name: 'User', value: `${parsedData.discord}` })
      .addFields({ name: 'Wallet', value: `${parsedData.wallet}` })
      .setTimestamp()
      .setFooter({
        text: 'Powered by HUNNY',
        iconURL:
          'https://cdn.discordapp.com/icons/892863900352135248/a_47c3f1bc9ea8f18aa868723401f3c954.webp',
      });

    const hook = await client.fetchWebhook(
      process.env.DISCORD_CLIENT_ID,
      parsedData.interactionToken
    );

    hook.editMessage('@original', {
      content: '',
      embeds: [embed],
      components: [],
      ephemeral: true,
    });
  } catch {
    console.log('error');
  }
});

client.login(process.env.DISCORD_TOKEN);
