const { Client, Collection, GatewayIntentBits } = require('discord.js');

require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

module.exports = client;

['command', 'event'].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});

client.login(process.env.DISCORD_TOKEN);
