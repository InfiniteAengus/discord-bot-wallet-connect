const Ably = require('ably');
const client = require('..');
const { EmbedBuilder } = require('discord.js');

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
