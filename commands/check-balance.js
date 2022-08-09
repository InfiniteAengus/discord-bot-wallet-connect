const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { apiUrl } = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-my-balance')
        .setDescription('Check balance'),
    async execute(interaction) {
        // const wallet = '0x01584Ad2fcC7D2Fe5937C539dbe8B6C30a61d89C';

        const res = await fetch(`${apiUrl}/getBalanceByWallet?ownerAddress=0x01584Ad2fcC7D2Fe5937C539dbe8B6C30a61d89C`, {
            method: 'GET',
            headers: {
                'Authorization': '8f5a202d-3cde-455d-8ac8-f306788c14f1',
            },
        });
        const data = await res.json();
        await interaction.reply(`hunnyBalance: ${data[0].hunnyBalance}`);
    },
};