const { ApplicationCommandType, Colors, PermissionsBitField } = require('discord.js')

module.exports = {
    name: 'voice-stats',
    description: '(⚙️) Moderation',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    const members = interaction.guild.members.cache;

    const voiceMembers = members.filter(member => member.voice.channel);
    const mutedMembers = voiceMembers.filter(member => member.voice.mute);
    const deafenedMembers = voiceMembers.filter(member => member.voice.deaf);
    const streamingMembers = voiceMembers.filter(member => member.voice.streaming);

    const totalVoiceMembers = voiceMembers.size;
    const totalMutedMembers = mutedMembers.size;
    const totalDeafenedMembers = deafenedMembers.size;
    const totalStreamingMembers = streamingMembers.size;

    return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            fields: [
                { name: 'Membres en vocal', value: `${totalVoiceMembers} membre(s)`, inline: true },
                { name: 'Membres muets', value: `${totalMutedMembers} membre(s)`, inline: true },
                { name: 'Membres en stream', value: `${totalStreamingMembers} membre(s)`, inline: true },
                { name: 'Membres en sourdine', value: `${totalDeafenedMembers} membre(s)`, inline: true }
            ],
            timestamp: new Date().toISOString(),
        }]
    })
    }
}