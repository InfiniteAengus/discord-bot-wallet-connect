const fs = require('node:fs');
const path = require('node:path');
const Ably = require('ably');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
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

  const collector = interaction.channel.createMessageComponentCollector();

  collector.on('collect', async (i) => {
    if (i.customId === 'yes') {
      //
    }
    else if (i.customId === 'no') {
      await i.update({ content: 'Tip has been cancelled', components: [] });
    }
  });

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  }
  catch (error) {
    console.log(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

// Login to Discord with your client's token
const ably = new Ably.Realtime(process.env.ABLY_API_KEY);
const channel = ably.channels.get('test');

channel.subscribe('wallet', function (message) {
  const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
  const ch = guild.channels.cache.find((c) => c.id === process.env.DISCORD_CHANNEL_ID);
//   ch.send();
});

client.login(process.env.DISCORD_TOKEN);
