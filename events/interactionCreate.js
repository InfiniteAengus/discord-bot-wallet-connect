const client = require('..');
const { allowedUsers } = require('../config.json');

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (allowedUsers.findIndex((user) => user.id === interaction.user.id) === -1) {
    return;
  }

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    // await interaction.deferReply({ ephemeral: true });
    await command.execute(client, interaction);
  } catch (error) {
    console.log(error);
    await interaction.editReply({
      content: '🤔 There was an error while executing this command',
      ephemeral: true,
    });
  }
});
