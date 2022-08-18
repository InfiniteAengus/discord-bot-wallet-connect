const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hunny')
    .setDescription('Hunny Balance'),
  async execute(client, interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('tip')
        .setLabel('Tip')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('balance')
        .setLabel('Check balance')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('connect')
        .setLabel('Connect your wallet')
        .setStyle(ButtonStyle.Primary)
    );

    interaction.reply({
      content: 'What do you want to do?',
      components: [row],
      ephemeral: true,
    }).then((m) => {
      const collector = m.createMessageComponentCollector();

      collector.on('collect', async (i) => {
        if (!i.isButton()) return;

        switch (i.customId) {
          case 'tip':
            break;
          case 'connect':
          case 'balance':
            // eslint-disable-next-line no-case-declarations
            const command = client.commands.get(i.customId);
            if (!command) return;

            try {
              await command.execute(client, i);
            } catch (error) {
              console.log(error);
              await i.reply({
                content: '🤔 There was an error while executing this command',
                ephemeral: true,
              });
            }
            break;
          default:
            break;
        }
      });
    });
  },
};
