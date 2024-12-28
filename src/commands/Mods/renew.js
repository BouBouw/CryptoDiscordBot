const { ApplicationCommandType, Colors } = require('discord.js')

module.exports = {
    name: 'renew',
    description: '(⚙️) Moderation',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.followUp({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    await interaction.channel.clone()
    .then(async (channel) => {
        channel.setPosition(interaction.channel.position)
        await interaction.channel.delete()
        return channel.send({
            embeds: [{
                color: Colors.Blue,
                description: `Le salon vient d'être recrée.`
            }]
        })
    })
    }
}