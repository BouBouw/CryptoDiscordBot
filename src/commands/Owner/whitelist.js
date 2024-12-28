const { ApplicationCommandType } = require('discord.js')

module.exports = {
    name: 'whitelist',
    description: '(👑) Owner',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    if(interaction.guild.ownerId !== interaction.member.id) return interaction.reply({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })
    }
}