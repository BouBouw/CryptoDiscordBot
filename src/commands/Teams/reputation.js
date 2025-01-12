const { ApplicationCommandType, ApplicationCommandOptionType, Collection, Colors } = require("discord.js");
const Users = require("../../../handlers/functions/Users");
const Teams = require("../../../handlers/functions/Teams/Teams");

const reputationCooldown = new Collection();

module.exports = {
    name: 'reputation',
    description: '(👥) Teams',
    type: ApplicationCommandType.ChatInput,
    options: [
            {
                name: "team",
                description: "Team name",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "user",
                description: "User of team",
                type: ApplicationCommandOptionType.User,
                required: false,
            },
        ],
execute: async (client, interaction, args, con) => {
    const teamId = interaction.options.getString('team');
    const target = interaction.options.getMember('user');

    if(!teamId && !target) return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: `Vous devez fournir un nom de team ou un utilisateur`
        }]
    });

    const currentTime = Date.now();
    const userCooldown = reputationCooldown.get(interaction.user.id) || [];

    const filteredCooldown = userCooldown.filter(timestamp => currentTime - timestamp < 2 * 60 * 60 * 1000);

    if (filteredCooldown.length >= 2) {
        const remainingTime = 2 * 60 * 60 * 1000 - (currentTime - filteredCooldown[0]);
        const minutes = Math.ceil(remainingTime / 60000);
        return interaction.reply({
          content: `Vous avez atteint la limite d'utilisation. Veuillez réessayer dans ${minutes} minutes.`,
          ephemeral: true,
        });
    };

    filteredCooldown.push(currentTime);
    reputationCooldown.set(interaction.user.id, filteredCooldown);

    if (target) {
        const p = await Users.getUser(target.id);
        con.query(`UPDATE profile SET reputations = '${(p.reputations + 1)}' WHERE userID = '${target.id}'`, function(err, result) {
            return interaction.reply({
                content: `Vous avez ajouté un point de réputation à ${target}.`,
            });
        })
      } else if (teamId) {
        const t = await Teams.GetTeamByName(teamId);
        con.query(`UPDATE teams SET reputations = '${(t.data[0].reputations + 1)}' WHERE name = '${teamId}'`, function(err, result) {
            return interaction.reply({
                content: `Vous avez ajouté un point de réputation à l'équipe "${teamName}".`,
            });
        })
      }

    }
}