const { ApplicationCommandType, ApplicationCommandOptionType, Colors } = require('discord.js')

module.exports = {
    name: 'temp-ban',
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
            description: 'Saction Duration (minutes)',
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
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.followUp({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    const user = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    const member = interaction.guild.members.cache.get(user.id);
    if(!member || !member.bannable) return interaction.reply({ content: `Impossible de bannir cet utilisateur.` });

    const unbanAt = Date.now() + duration * 60 * 1000

    try {
        await member.ban({ reason: reason });
        interaction.reply({
            embeds: [{
                color: Colors.Blue,
                description: `${user} vient d'être banni pour ${duration} minutes.`
            }]
        }).then(() => {
            con.query(`INSERT INTO tempbans (userId, guildId, unbanAt, reason) VALUES (?, ?, ?, ?)`, [user.id, interaction.guild.id, unbanAt, reason], function(err, result) {
                
            })
        })
    } catch(error) {
        return;
    }

    }
}