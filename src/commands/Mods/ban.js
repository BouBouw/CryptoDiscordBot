const { ApplicationCommandType, Colors, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js')

module.exports = {
    name: 'ban',
    description: '(⚙️) Moderation',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "User of sanction",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "reason",
            description: "Reason",
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.followUp({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString("reason") || "Aucune raison fournie.";

    if(target.id === interaction.member.id) return;

    await target.ban({ reason: reason }).then(() => {
        interaction.reply({
            embeds: [{
                color: Colors.Blue,
                description: `${target} (\`${target.id}\`) vient d'être banni.`
            }]
        })
    })
    }
}