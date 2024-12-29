const { ApplicationCommandType, ApplicationCommandOptionType, Colors } = require('discord.js')

module.exports = {
    name: 'unmute',
    description: '(⚙️) Moderation',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'user',
            description: 'Sanction User',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    const user = interaction.options.getMember('user');

    if(!user || !user.moderatable) return interaction.reply({ content: `Impossible de rendre muet cet utilisateur.` });

    try {
        await user.timeout(null);
        interaction.reply({
            embeds: [{
                color: Colors.Blue,
                description: `${user} n'est plus muet.`
            }]
        })
    } catch(error) {
        return;
    }

    }
}