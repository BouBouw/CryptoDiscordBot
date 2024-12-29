const { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, Colors } = require('discord.js');

module.exports = {
    name: 'unban',
    description: '(⚙️) Moderation',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'id',
            description: 'user ID',
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
    ],
execute: async (client, interaction, args, con) => {
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` });

        const target = interaction.options.getNumber('id');

        const bannedUsers = await interaction.guild.fetchBans();
        const user = bannedUsers.get(target).user;

        try {
            interaction.guild.members.unban(target).then(() => {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `${user.username} (\`${target}\`) vient d'être débanni.`
                    }]
                })
            })
        } catch(error) {
            return interaction.reply({
                embeds: [{
                    color: Colors.Blue,
                    description: `${client.members.cache.get(target)} (\`${target}\`) n'est pas banni.`
                }]
            })
        }
    }
}