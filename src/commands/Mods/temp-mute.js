const { ApplicationCommandType, ApplicationCommandOptionType, Colors } = require('discord.js')

module.exports = {
    name: 'temp-mute',
    description: '(⚙️) Moderation',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'user',
            description: 'Sanction User',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'duration',
            description: 'Saction DUration (minutes)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
        {
            name: 'reason',
            description: 'Sanction Reason',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.followUp({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    const user = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if(!user || !user.moderatable) return interaction.reply({ content: `Impossible de rendre muet cet utilisateur.` });

    try {
        await user.timeout(duration * 60 * 1000, reason);
        interaction.reply({
            embeds: [{
                color: Colors.Blue,
                description: `${user} vient d'être rendu muet pour ${duration} minutes.`
            }]
        })
    } catch(error) {
        return;
    }

    }
}