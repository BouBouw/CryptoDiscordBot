const { ApplicationCommandType, Colors, ApplicationCommandOptionType } = require('discord.js')

module.exports = {
    name: 'team-withdraw',
    description: '(👥) Teams',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "coins",
            description: "coins invest",
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    const coins = interaction.options.getNumber('coins');
    }
}