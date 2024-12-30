const { ApplicationCommandType, Colors, ApplicationCommandOptionType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const botStatusMapping = {
    'offline': '⚫',
    'online': '🟢',
    'dnd': '🔴',
    'idle': '🟡'
}

const langMapping = {
    'EN_en': "English",
    'FR_fr': "Français",
    'ES_es': "Español",
    'DE_de': "Deutsch",
    'IT_it': "Italiano",
    'CH_ch': "中國人",
    'AR_ar': "عربي"
}

module.exports = {
    name: 'configuration',
    description: '(📌) Administration',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` });

    const mainRow = [
        new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('settings.bot')
            .setLabel("Gérer le robot")
            .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
            .setCustomId('settings.languages')
            .setLabel("Changer la langue")
            .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
            .setURL('http://localhost:90')
            .setLabel("Panneau de Configuration")
            .setStyle(ButtonStyle.Link),
        ),
        new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('settings.manage.guild')
            .setLabel("Gestion du serveur")
            .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
            .setCustomId('settings.manage.security')
            .setLabel("Gestion de la sécurité")
            .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
            .setCustomId('settings.manage.moderation')
            .setLabel("Gestion de la modération")
            .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
            .setCustomId('settings.manage.economy')
            .setLabel("Gestion de l'économie")
            .setStyle(ButtonStyle.Secondary),
        ),
        new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('settings.auto.logs')
            .setLabel('Configurer automatiquement le robot')
            .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId('settings.reset')
            .setLabel('Réinitialiser les paramètres du robot')
            .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
            .setURL('http://localhost:90/documentation')
            .setLabel("Documentation")
            .setStyle(ButtonStyle.Link),
        )
    ]

    con.query(`SELECT * FROM settings WHERE id = '1'`, function(err, result) {
        return interaction.reply({
            embeds: [{
                color: Colors.Blue,
                thumbnail: {
                    url: client.user.displayAvatarURL(),
                },
                fields: [
                    {
                        name: `Robot`,
                        value: `Nom: \`${client.user.username}\` (${client.user})\nActivité: \`${botStatusMapping[client.presence?.status || 'offline']}\` ${client.presence?.activities}`,
                        inline: false
                    },
                    {
                        name: `Language`,
                        value: `${langMapping[result[0]?.language]}`,
                        inline: false
                    },
                ]
            }],
            components: mainRow
        }).then(async (msg) => {
            const filter = (i) => i.user.id === interaction.member.id && i.isButton();
            await Buttons();

            async function Buttons() {
                let collected;

                try {
                    collected = await msg.awaitMessageComponent({ filter: filter });
                } catch(error) {
                    if (err.code === "INTERACTION_COLLECTOR_ERROR") {
                        return msg.delete()
                    }
                }

                if (!collected.deffered) await collected.deferUpdate();

                switch(collected.customId) {
                    case 'settings.main': {
                        msg.edit({
                            embeds: [{
                                color: Colors.Blue,
                                thumbnail: {
                                    url: client.user.displayAvatarURL(),
                                },
                                description: `**__Configuration__**`,
                                fields: [
                                    {
                                        name: `Robot`,
                                        value: `Nom: \`${client.user.username}\` (${client.user})\nActivité: \`${botStatusMapping[client.presence?.status || 'offline']}\` ${client.presence?.activities}`,
                                        inline: false
                                    },
                                    {
                                        name: `Language`,
                                        value: `${langMapping[result[0]?.language]}`,
                                        inline: false
                                    },
                                ]
                            }],
                            components: mainRow
                        });

                        await Buttons();
                        break;
                    }

                    case 'settings.bot': {
                        msg.edit({
                            embeds: [{
                                color: Colors.Blue,
                                description: `Configuration > **__Gestion du robot__**`,
                                fields: [
                                    {
                                        name: `${client.user.username}`,
                                        value: `\`${botStatusMapping[client.presence?.status || 'offline']}\` ${client.presence?.activities}`
                                    }
                                ]
                            }],
                            components: [
                                new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                    .setCustomId('settings.manager.bot')
                                    .setPlaceholder("Choisissez une action")
                                    .addOptions(
                                        new StringSelectMenuOptionBuilder()
					                    .setLabel("Modifier le nom d'utilisateur")
					                    .setValue('settings.manager.bot.nickname'),
                                        new StringSelectMenuOptionBuilder()
					                    .setLabel("Modifier l'activité du robot")
					                    .setValue('settings.manager.bot.presence'),
                                        new StringSelectMenuOptionBuilder()
					                    .setLabel("Modifier l'avatar du robot")
					                    .setValue('settings.manager.bot.avatar'),
                                        new StringSelectMenuOptionBuilder()
					                    .setLabel("Modifier la couleur principale")
                                        .setDescription("Couleur sur le bord des embeds.")
					                    .setValue('settings.manager.bot.embed_color'),
                                    )
                                ),
                                new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setCustomId('settings.main')
                                    .setLabel("Retour à la page principale")
                                    .setStyle(ButtonStyle.Primary)
                                )
                            ]
                        }).then(async (m) => {
                            const filter = (i) => i.user.id === interaction.member.id && i.isStringSelectMenu();
                            await Selects();

                            async function Selects() {
                                let select;

                                try {
                                    select = await m.awaitMessageComponent({ filter: filter });
                                } catch(error) {
                                    if (err.code === "INTERACTION_COLLECTOR_ERROR") {
                                        return m.delete()
                                    }
                                }
                            
                                // if (!select.deffered) await select.deferUpdate();

                                switch(select.values[0]) {
                                    case 'settings.manager.bot.nickname': {
                                        const modal = new ModalBuilder()
                                        .setCustomId('settings.manager.bot.nickname')
                                        .setTitle("Modifier le nom d'utilisateur")
                                        .addComponents(
                                            new ActionRowBuilder().addComponents(
                                                new TextInputBuilder()
                                                    .setCustomId('nickname_input')
                                                    .setLabel("Quel est le nouveau nom ?")
                                                    .setMaxLength(16)
                                                    .setStyle(TextInputStyle.Short)
                                            )
                                        );

                                        await select.showModal(modal);
                                        
                                        const filter = (interaction) =>
                                            interaction.customId === 'settings.manager.bot.nickname' &&
                                            interaction.user.id === select.user.id;

                                        try {
                                            const modalInteraction = await select.awaitModalSubmit({ filter, time: 60000 });

                                            const newNickname = modalInteraction.fields.getTextInputValue('nickname_input');
                                    
                                            await client.user.setUsername(newNickname);
                                            await modalInteraction.reply({
                                                embeds: [
                                                    {
                                                        color: Colors.Blue,
                                                        description: `Le nom d'utilisateur vient d'être modifié.`,
                                                        footer: {
                                                            text: "Redémarrage en cours...",
                                                        },
                                                    },
                                                ],
                                            });
                                    
                                            process.exit(0);
                                        } catch(error) {
                                            throw error;
                                        }
                                        break;
                                    }

                                    case 'settings.manager.bot.presence': {
                                        // edit with new option : status, text
                                        break;
                                    }

                                    case 'settings.manager.bot.avatar': {
                                        // collector url / attachment
                                        break;
                                    }

                                    case 'settings.manager.bot.embed_color': {
                                        // redirect on website
                                        break;
                                    }
                                }
                            }
                        })

                        await Buttons();
                        break;
                    }

                    case 'settings.languages': {
                        msg.edit({
                            embeds: [{
                                color: Colors.Blue,
                                description: `Configuration > **__Gérer la langue__**`,
                                fields: [
                                    {
                                        name: `Langue`,
                                        value: `${langMapping[result[0]?.language]}`
                                    }
                                ]
                            }],
                            components: [
                                new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                    .setCustomId('settings.manager.language')
                                    .setPlaceholder("Choisissez une action")
                                    .addOptions(
                                        new StringSelectMenuOptionBuilder()
                                        .setEmoji('🇬🇧')
					                    .setLabel("English")
					                    .setValue('settings.manager.language.english'),
                                        new StringSelectMenuOptionBuilder()
                                        .setEmoji('🇫🇷')
					                    .setLabel("Français")
					                    .setValue('settings.manager.language.french'),
                                        new StringSelectMenuOptionBuilder()
                                        .setEmoji('🇪🇸')
					                    .setLabel("Español")
					                    .setValue('settings.manager.language.spanish'),
                                        new StringSelectMenuOptionBuilder()
                                        .setEmoji('🇩🇪')
					                    .setLabel("Deutsch")
					                    .setValue('settings.manager.language.deutsh'),
                                        new StringSelectMenuOptionBuilder()
                                        .setEmoji('🇮🇹')
					                    .setLabel("Italiano")
					                    .setValue('settings.manager.language.italian'),
                                        new StringSelectMenuOptionBuilder()
                                        .setEmoji('🇨🇳')
					                    .setLabel("中國人")
					                    .setValue('settings.manager.language.chinese'),
                                        new StringSelectMenuOptionBuilder()
                                        .setEmoji('🇺🇳')
					                    .setLabel("عربي")
					                    .setValue('settings.manager.language.arabic'),
                                    )
                                ),
                                new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setCustomId('settings.main')
                                    .setLabel("Retour à la page principale")
                                    .setStyle(ButtonStyle.Primary)
                                )
                            ]
                        }).then(async (m) => {
                            const filter = (i) => i.user.id === interaction.member.id && i.isStringSelectMenu();
                            await Selects();

                            async function Selects() {
                                let select;

                                try {
                                    select = await m.awaitMessageComponent({ filter: filter });
                                } catch(error) {
                                    if (err.code === "INTERACTION_COLLECTOR_ERROR") {
                                        return m.delete()
                                    }
                                }
                            
                                if (!select.deffered) await select.deferUpdate();

                                switch(select.values[0]) {
                                    case 'settings.manager.language.english': {
                                        con.query(`UPDATE settings SET language = 'EN_en' WHERE id = '1'`, function(err, result) {
                                            return interaction.channel.send({
                                                embeds: [{
                                                    color: Colors.Blue,
                                                    description: `You just changed the language to **English**.`
                                                }]
                                            })
                                        })

                                        await Selects();
                                        await Buttons();
                                        break;
                                    }

                                    case 'settings.manager.language.french': {
                                        con.query(`UPDATE settings SET language = 'FR_fr' WHERE id = '1'`, function(err, result) {
                                            return interaction.channel.send({
                                                embeds: [{
                                                    color: Colors.Blue,
                                                    description: `Vous venez de changer la langue en **Français**.`
                                                }]
                                            })
                                        })

                                        await Selects();
                                        await Buttons();
                                        break;
                                    }

                                    case 'settings.manager.language.spanish': {
                                        con.query(`UPDATE settings SET language = 'ES_es' WHERE id = '1'`, function(err, result) {
                                            return interaction.channel.send({
                                                embeds: [{
                                                    color: Colors.Blue,
                                                    description: `Acabas de cambiar el idioma a **Español**.`
                                                }]
                                            })
                                        })

                                        await Selects();
                                        await Buttons();
                                        break;
                                    }

                                    case 'settings.manager.language.deutsh': {
                                        con.query(`UPDATE settings SET language = 'DE_de' WHERE id = '1'`, function(err, result) {
                                            return interaction.channel.send({
                                                embeds: [{
                                                    color: Colors.Blue,
                                                    description: `Sie haben gerade die Sprache auf **Deutsch** geändert.`
                                                }]
                                            })
                                        })

                                        await Selects();
                                        await Buttons();
                                        break;
                                    }

                                    case 'settings.manager.language.italian': {
                                        con.query(`UPDATE settings SET language = 'IT_it' WHERE id = '1'`, function(err, result) {
                                            return interaction.channel.send({
                                                embeds: [{
                                                    color: Colors.Blue,
                                                    description: `Hai appena cambiato la lingua in **Italiano**.`
                                                }]
                                            })
                                        })

                                        await Selects();
                                        await Buttons();
                                        break;
                                    }

                                    case 'settings.manager.language.chinese': {
                                        con.query(`UPDATE settings SET language = 'CH_ch' WHERE id = '1'`, function(err, result) {
                                            return interaction.channel.send({
                                                embeds: [{
                                                    color: Colors.Blue,
                                                    description: `您剛剛將語言變更為中文`
                                                }]
                                            })
                                        })

                                        await Selects();
                                        await Buttons();
                                        break;
                                    }

                                    case 'settings.manager.language.arabic': {
                                        con.query(`UPDATE settings SET language = 'AR_ar' WHERE id = '1'`, function(err, result) {
                                            return interaction.channel.send({
                                                embeds: [{
                                                    color: Colors.Blue,
                                                    description: `لقد قمت للتو بتغيير اللغة إلى العربية`
                                                }]
                                            })
                                        })

                                        await Selects();
                                        await Buttons();
                                        break;
                                    }
                                }
                            }
                        })
                        
                        await Buttons();
                        break;
                    }
                }
            }
        })
    })
    }
}