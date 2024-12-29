const { ApplicationCommandType, ApplicationCommandOptionType, Colors, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    name: 'whitelist',
    description: '(👑) Owner',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "type",
            description: "Type",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Add',
                    value: 'add'
                },
                {
                    name: 'Remove',
                    value: 'remove'
                },
                {
                    name: 'List',
                    value: 'list'
                },
            ]
        },
        {
            name: "user",
            description: "User of whitelist",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
execute: async (client, interaction, args, con) => {
    if(interaction.guild.ownerId !== interaction.member.id) return interaction.reply({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })
    
    const target = interaction.options.getMember('user');
    const type = interaction.options.getString('type');

    switch(type) {
        case 'add': {
            if(!target) return interaction.reply({ content: `Vous devez mentionner un utilisateur.` });

            con.query(`SELECT * FROM whitelist WHERE userID = '${target.id}'`, function(err, result) {
                if(!result[0]) {
                    con.query(`INSERT INTO whitelist (userID) VALUES ('${target.id}')`, function(err, result) {
                        return interaction.reply({
                            embeds: [{
                                color: Colors.Blue,
                                description: `${target} vient d'être ajouté(e) à la liste blanche.`
                            }]
                        })
                    })
                } else {
                    return interaction.reply({
                        embeds: [{
                            color: Colors.Blue,
                            description: `${target} est déjà dans la liste blanche.`
                        }]
                    })
                }
            })
            break;
        }

        case 'remove': {
            if(!target) return interaction.reply({ content: `Vous devez mentionner un utilisateur.` });

            con.query(`SELECT * FROM whitelist WHERE userID = '${target.id}'`, function(err, result) {
                if(!result[0]) return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `${target} n'est pas dans la liste blanche.`
                    }]
                });

                con.query(`DELETE FROM whitelist WHERE userID = '${target.id}'`, function(err, result) {
                    return interaction.reply({
                        embeds: [{
                            color: Colors.Blue,
                            description: `${target} vient d'être retiré(e) de la liste blanche.`
                        }]
                    })
                })
            })
            break;
        }

        case 'list': {
            con.query(`SELECT * FROM whitelist ORDER BY createdAt DESC`, function(err, result) {
                const pageSize = 10;
                let currentPage = 0;
                const totalPages = Math.ceil(result.length / pageSize);
    
                function generateEmbed(page) {
                    const start = page * pageSize;
                    const end = start + pageSize;
                    const pageData = result.slice(start, end);
    
                    const embed = new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .setFooter({ text: `Page: ${page + 1}/${totalPages}` });
    
                    if (pageData.length === 0) {
                        embed.setDescription('Aucun membre dans la liste blanche.');
                    } else {
                        embed.setDescription(
                            pageData
                                .map((entry, index) => 
                                    `\`#${start + index + 1}\` <@${entry.userID}>\nAjouté le: <t:${Math.floor(entry.createdAt / 1000)}:f>`)
                                .join('\n\n')
                        );
                    }
    
                    return embed;
                }
    
                interaction.reply({
                    embeds: [ generateEmbed(currentPage) ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('⬅️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentPage === 0),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('➡️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentPage === totalPages - 1)
                        )
                    ],
                    fetchReply: true,
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
                            case 'previous': {
                                if(currentPage > 0) return currentPage--;

                                await msg.edit({
                                    embeds: [generateEmbed(currentPage)],
                                    components: [
                                        new ActionRowBuilder().addComponents(
                                            new ButtonBuilder()
                                                .setCustomId('previous')
                                                .setLabel('⬅️')
                                                .setStyle(ButtonStyle.Primary)
                                                .setDisabled(currentPage === 0),
                                            new ButtonBuilder()
                                                .setCustomId('next')
                                                .setLabel('➡️')
                                                .setStyle(ButtonStyle.Primary)
                                                .setDisabled(currentPage === totalPages - 1)
                                        ),
                                    ],
                                });

                                break;
                            }

                            case 'next': {
                                if(currentPage < totalPages - 1) return currentPage++

                                await msg.edit({
                                    embeds: [generateEmbed(currentPage)],
                                    components: [
                                        new ActionRowBuilder().addComponents(
                                            new ButtonBuilder()
                                                .setCustomId('previous')
                                                .setLabel('⬅️')
                                                .setStyle(ButtonStyle.Primary)
                                                .setDisabled(currentPage === 0),
                                            new ButtonBuilder()
                                                .setCustomId('next')
                                                .setLabel('➡️')
                                                .setStyle(ButtonStyle.Primary)
                                                .setDisabled(currentPage === totalPages - 1)
                                        ),
                                    ],
                                });
                                break;
                            }
                        }
                    }
                })
    
            })
            break;
        }
    }
    }
}