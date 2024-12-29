const { ApplicationCommandType, Colors } = require('discord.js')

module.exports = {
    name: 'voice-kick',
    description: '(⚙️) Moderation',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    const channel = interaction.member.voice.channel;
    if(!channel) return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: `Vous n'êtes pas dans un salon vocal.`
        }]
    });
    
    const size = channel.members.size;
    channel.members.forEach(async (m) => {
        await m.voice.kick();
    });

    return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: `${size} membres déconnectés de ${channel}.`
        }]
    })
    }
}