const { ApplicationCommandType } = require('discord.js');
const Languages = require('../../../handlers/functions/Languages');

module.exports = {
    name: 'ping',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    const text = await Languages.getLangCommands(interaction.commandName, con);
    
    interaction.reply({ content: `${interaction.member} ${text}` })
    }
}