const { ApplicationCommandType, Colors, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'role-infos',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "role",
            description: "Role",
            type: ApplicationCommandOptionType.Role,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    const role = interaction.options.getRole('role');

    const created = Math.floor((Date.now() - role.createdAt) / 86400000);

    let perms = {
        [PermissionsBitField.Flags.Administrator]: "`Administrateur`",
        [PermissionsBitField.Flags.ViewGuildInsights]: "`Voir les informations du serveur`",
        [PermissionsBitField.Flags.ViewAuditLog]: "`Voir les logs du serveur`",
        [PermissionsBitField.Flags.ManageGuild]: "`Gérer le serveur`",
        [PermissionsBitField.Flags.ManageRoles]: "`Gérer les rôles`",
        [PermissionsBitField.Flags.ManageChannels]: "`Gérer les salons`",
        [PermissionsBitField.Flags.KickMembers]: "`Expulser des membres`",
        [PermissionsBitField.Flags.BanMembers]: "`Bannir des membres`",
        [PermissionsBitField.Flags.CreateInstantInvite]: "`Créer une invitation`",
        [PermissionsBitField.Flags.ChangeNickname]: "`Changer le pseudo`",
        [PermissionsBitField.Flags.ManageNicknames]: "`Gérer les pseudos`",
        [PermissionsBitField.Flags.ManageEmojisAndStickers]: "`Gérer les émojis et stickers`",
        [PermissionsBitField.Flags.ManageWebhooks]: "`Gérer les webhooks`",
        [PermissionsBitField.Flags.ViewChannel]: "`Voir les salons textuels et vocaux`",
        [PermissionsBitField.Flags.SendMessages]: "`Envoyer des messages`",
        [PermissionsBitField.Flags.SendTTSMessages]: "`Envoyer des messages TTS`",
        [PermissionsBitField.Flags.ManageMessages]: "`Gérer les messages`",
        [PermissionsBitField.Flags.EmbedLinks]: "`Intégrer des liens`",
        [PermissionsBitField.Flags.AttachFiles]: "`Joindre des fichiers`",
        [PermissionsBitField.Flags.ReadMessageHistory]: "`Voir les anciens messages`",
        [PermissionsBitField.Flags.MentionEveryone]: "`Mentionner @everyone, @here et tous les rôles`",
        [PermissionsBitField.Flags.UseExternalEmojis]: "`Utiliser des émojis externes`",
        [PermissionsBitField.Flags.AddReactions]: "`Ajouter des réactions`",
        [PermissionsBitField.Flags.Connect]: "`Se connecter`",
        [PermissionsBitField.Flags.Speak]: "`Parler`",
        [PermissionsBitField.Flags.Stream]: "`Vidéo`",
        [PermissionsBitField.Flags.MuteMembers]: "`Couper le micro des membres`",
        [PermissionsBitField.Flags.DeafenMembers]: "`Mettre en sourdine des membres`",
        [PermissionsBitField.Flags.MoveMembers]: "`Déplacer les membres`",
        [PermissionsBitField.Flags.UseVAD]: "`Utiliser la détection de la voix`",
        [PermissionsBitField.Flags.PrioritySpeaker]: "`Voix prioritaire`"
    };
    
    for (const [key, value] of Object.entries(PermissionsBitField.Flags)) {
        if (!perms[value]) {
            perms[value] = `\`${key.replace(/([A-Z])/g, ' $1').trim()}\``;
        }
    }
    
    const allowed = Object.entries(role.permissions.serialize())
        .filter(([perm, isAllowed]) => isAllowed)
        .map(([perm]) => perms[PermissionsBitField.Flags[perm]] || `\`${perm}\``)
        .join(', ');

    return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            title: `${role.name}`,
            fields: [
                {
                    name: `↬ Informations temporelle`,
                    value: `> Crée le ${moment(role.createdAt).format('DD/MM/YYYY')} (Il y a **${created}** jours)`
                },
                {
                    name: `↬ Informations serveur`,
                    value: `> Mention: ${role}\n> Nom: **${role.name}**\n> Identifiant: \`${role.id}\`\n> Couleur: \`${role.hexColor}\``
                },
                {
                    name: `↬ Informations membres`,
                    value: `> Membre ayant le rôle: ${role.members.size}\n> Mentionnable: ${role.mentionable ? '**Oui**' : '**Non**'}`
                },
                {
                    name: `↬ Permissions`,
                    value: `${allowed || 'Aucune'}`
                }
            ]
        }]
    })
    }
}