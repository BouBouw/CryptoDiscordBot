const { ApplicationCommandType, ChannelType, Colors, PresenceUpdateStatus } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'server-infos',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    const created = Math.floor((Date.now() - interaction.guild.createdTimestamp) / 86400000);

    await interaction.guild.fetchOwner().then(async (member) => {
        interaction.reply({
            embeds: [{
                color: Colors.Blue,
                title: `${interaction.guild.name}`,
                description: `> Description: **${!interaction.guild.description && interaction.guild.description == null ? "Aucune description de serveur" : interaction.guild.description}**`,
                thumbnail: {
                    url: `${interaction.guild.iconURL({ dynamic: true }) || "https://static.vecteezy.com/system/resources/previews/006/892/625/non_2x/discord-logo-icon-editorial-free-vector.jpg"}`,
                },
                fields: [
                    {
                        name: `↬ Informations temporelle`,
                        value: `> Crée le ${moment(interaction.guild.createdAt).format('DD/MM/YYYY')} (Il y a **${created}** jours)`,
                    },
                    {
                        name: `↬ Informations serveur`,
                        value: `> Nom: **${interaction.guild.name}** \n> Identifiant: \`${interaction.guild.id}\`\n> Boosts: \`${interaction.guild.premiumSubscriptionCount}\`\n> Lien personnalisé: **${interaction.guild.vanityURLCode !== null && undefined ? interaction.guild.vanityURLCode : "Aucun lien perso."}**`,
                    },
                    {
                        name: `↬ Informations publique`,
                        value: `> Vérifié: ${interaction.guild.verified ? '`✅`' : '`❌`'}\n> Partenaire: ${interaction.guild.partnered ? '`✅`' : '`❌`'}`
                    },
                    {
                        name: `↬ Informations créateur`,
                        value: `> Nom d'utilisateur: **${member.user.username}** \n> Discriminateur: \`#${member.user.discriminator}\` \n> Identifiant: \`${member.user.id}\` \n> Surnom: ${member.user}`,
                    },
                    {
                        name: `↬ Informations membres`,
                        value: `> Membres: \`${interaction.guild.memberCount}\`\n> En ligne: \`${interaction.guild.members.cache.filter(m => m.presence?.status === PresenceUpdateStatus.Online).size}\` | Inactif: \`${interaction.guild.members.cache.filter(m => m.presence?.status === PresenceUpdateStatus.Idle).size}\` | Ne pas déranger: \`${interaction.guild.members.cache.filter(m => m.presence?.status === PresenceUpdateStatus.Dnd).size}\` | Hors-ligne: \`${interaction.guild.members.cache.filter(m => !m.presence || m.presence.status === PresenceUpdateStatus.Offline).size}\``,
                    },
                    {
                        name: `↬ Informations rôles`,
                        value: `> Nombre de rôles: \`${interaction.guild.roles.cache.size}\`\n> Liste des rôles: ${interaction.guild.roles.cache.map(r => `<@&${r.id}>`).join(', ')}`
                    },
                    {
                        name: `↬ Informations salons`,
                        value: `> Nombre de salons: \`${interaction.guild.channels.cache.size}\`\n> Textuel: \`${Math.round(interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size)}\`\n> Vocaux: \`${Math.round(interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size + interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildStageVoice).size)}\``
                    },
                    {
                        name: `↬ Informations emojis`,
                        value: `> Nombre d'emojis: \`${interaction.guild.emojis.cache.size}\`\n> Liste des emojis: ${interaction.guild.emojis.cache.map(e => e).join(', ')}`
                    }
                ]
            }]
        })
    })

    }
}