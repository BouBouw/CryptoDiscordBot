const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { War } = require("../../../handlers/functions/Teams/War");
const Teams = require("../../../handlers/functions/Teams/Teams");

module.exports = {
    name: 'war',
    description: '(👥) Teams',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "team",
            description: "teamID",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    const t = await Teams.CheckTeam(interaction.user.id);
    const t_2 = interaction.options.getString('team');

    await War.createBattleThread(t.data[0].name, t_2, interaction);
    }
}