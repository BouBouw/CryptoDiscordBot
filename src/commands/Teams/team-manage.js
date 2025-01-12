const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: 'team-manage',
    description: '(👥) Teams',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "User of team",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
execute: async (client, interaction, args, con) => {

    }
}