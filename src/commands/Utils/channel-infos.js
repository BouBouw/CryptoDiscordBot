const { ApplicationCommandType, Colors, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'channel-infos',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "channel",
            description: "Channel",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        }
    ],
execute: async (client, interaction, args, con) => {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const created = Math.floor((Date.now() - channel.createdTimestamp) / 86400000);
    
    return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            title: `${channel.name}`,
            description: `Topic:\n\`\`\`${channel.topic || 'Aucun'}\`\`\``,
            fields: [
                {
                    name: `↬ Informations temporelle`,
                    value: `Crée le ${moment(channel.createdAt).format('DD/MM/YYYY')} (Il y a **${created}** jours)`
                },
                {
                    name: `↬ Informations serveur`,
                    value: `> Mention: ${channel}\n> Nom: **${channel.name}**\n> Identifiant: \`${channel.id}\``
                },
                {
                    name: `↬ Informations salon`,
                    value: `> NSFW: ${channel.nsfw ? 'Oui' : 'Non'}`
                }
            ]
        }]
    })
    }
}