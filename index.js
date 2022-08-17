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

  if (allowedUsers.findIndex((user) => user === interaction.user.tag) === -1) {
    return;
  }

  const collector = interaction.channel.createMessageComponentCollector();

  collector.on('collect', async (i) => {
    if (
      i.customId === 'tip' ||
      i.customId === 'connect' ||
      i.customId === 'balance'
    ) {
      const command = client.commands.get(i.customId);
      if (!command) return;

      try {
        await i.deferReply({ ephemeral: true });
        await command.execute(i);
      } catch (error) {
        console.log(error);
        await i.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    } else if (i.customId === 'tip-yes') {
      i.deferReply({ ephemeral: true });

      const userId = getUserNameFromMessage(i.message.content);
      const user = client.users.cache.find((u) => u.id === userId);
      const userTag = user.username + '#' + user.discriminator;
      const amount = getAmountFromMessage(i.message.content);

      const senderWallet = await getWalletFromDiscordUser(interaction.user.tag);
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

      try {
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
          await i.editReply({ content: data.error.message, components: [] });
        } else {
          await i.editReply({
            content: 'Successfully transferred',
            components: [],
          });
        }
      } catch (e) {
        console.log(e);
        await i.update({ content: 'Cannot send hunny', components: [] });
      }

      //  const user = i.message.interaction.options.getUser('user');
      //  console.log(user);
    } else if (i.customId === 'tip-no') {
      await i.update({ content: 'Tip has been cancelled', components: [] });
    }
  });

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await interaction.deferReply({ ephemeral: true });
    await command.execute(interaction);
  } catch (error) {
    console.log(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

// Login to Discord with your client's token
const ably = new Ably.Realtime(process.env.ABLY_API_KEY);
const channel = ably.channels.get('discord-wallet');

channel.subscribe('wallet', function (message) {
  const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
  const ch = guild.channels.cache.find(
    (c) => c.id === process.env.DISCORD_CHANNEL_ID
  );
  const parsedData = message.data;

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('✨ Successfully connected wallet')
    .addFields({ name: 'User', value: `${parsedData.discord}` })
    .addFields({ name: 'Wallet', value: `${parsedData.wallet}` })
    .setTimestamp()
    .setFooter({
      text: 'Powered by Bad Bears x BeeFrens',
      iconURL:
        'https://cdn.discordapp.com/icons/892863900352135248/a_47c3f1bc9ea8f18aa868723401f3c954.webp',
    });

  ch.send({ embeds: [embed], ephemeral: true });
});

client.login(process.env.DISCORD_TOKEN);
