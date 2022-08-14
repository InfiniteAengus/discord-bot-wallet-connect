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
const { getWalletFromDiscordUser } = require('./helper');
require('dotenv').config({ debug: process.env.DEBUG });

const getUserNameFromMessage = (message) => {
  let i = message.length - 1;
  for (; i >= 0; i--) {
    if (message[i] === '<') break;
  }

  return message.slice(i + 2, message.length - 2);
};

const getAmountFromMessage = (message) => {
  let i = 21;
  for (; message[i] !== ' '; i++);
  return message.slice(21, i);
};

const hashCode = (str) => {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

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
    if (i.customId === 'yes') {
      const userId = getUserNameFromMessage(i.message.content);
      const user = client.users.cache.find((u) => u.id === userId);
      const userTag = user.username + '#' + user.discriminator;
      const amount = getAmountFromMessage(i.message.content);

      const senderWallet = await getWalletFromDiscordUser(interaction.user.tag);
      const receiverWallet = await getWalletFromDiscordUser(userTag);
      const hashToken = hashCode(process.env.BACKEND_API_TOKEN + senderWallet);

      const res = await fetch(`${process.env.BACKEND_API_TOKEN}/transfer`, {
        method: 'POST',
        body: {
            senderWallet: senderWallet,
            receiverWallet: receiverWallet,
            amount: amount,
            token: hashToken,
        },
      });

      const data = await res.json();

      await i.update({ content: data });
      //  const user = i.message.interaction.options.getUser('user');
      //  console.log(user);
    } else if (i.customId === 'no') {
      await i.update({ content: 'Tip has been cancelled', components: [] });
    }
  });

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
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
