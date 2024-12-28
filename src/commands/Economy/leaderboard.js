const { ApplicationCommandType, ApplicationCommandOptionType, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    name: 'leaderboard',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "type",
            description: "Type",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Economy',
                    value: 'economy'
                },
                {
                    name: 'Ranks',
                    value: 'ranks'
                },
            ]
        },
    ],
execute: async (client, interaction, args, con) => {
    let page = 1
    const type = interaction.options.getString('type');

    switch(type) {
        case 'economy': {
            const leaderboard = await getLeaderboardEconomy(page);
            
            if(leaderboard.length === 0) return interaction.reply({
                embeds: [{
                    color: Colors.Blue,
                    description: `Il n'y a aucun membres dans le leaderboard.`
                }]
            });

            const leaderboardText = leaderboard.map((user, index) => {
                return `${index + 1 + (page - 1) * 10}. <@${user.userID}> - Coins **${user.coins}** \`(💰 ${user.inBank})\` \`(🪙 ${user.crypto})\``;
            }).join('\n');

            const embed = {
                color: Colors.Blue,
                title: `Leaderboard - Economy`,
                description: leaderboardText,
                timestamp: new Date(),
                footer: {
                    text: `Page ${page}`,
                },
            };

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Précédent')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1),

                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Suivant')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(leaderboard.length < 10)
                );

            const reply = await interaction.reply({
                embeds: [embed],
                components: [row],
            });

            const filter = i => i.user.id === interaction.user.id;

            const collector = reply.createMessageComponentCollector({
                filter,
                time: 60000,
            });

            collector.on('collect', async i => {
                if (i.customId === 'prev') {
                    page--;
                } else if (i.customId === 'next') {
                    page++;
                }

                const leaderboard = await getLeaderboard(page, con);

                const embed = {
                    color: Colors.Blue,
                    title: `Leaderboard - Economy`,
                    description: leaderboard.map((user, index) => {
                        return `${index + 1 + (page - 1) * 10}. <@${user.userID}> - Coins **${user.coins}** \`(💰 **${user.inBank}** | 🪙 **${user.crypto}**)\``;
                    }).join('\n'),
                    timestamp: new Date(),
                    footer: {
                        text: `Page ${page}`,
                    },
                };

                await i.update({
                    embeds: [embed],
                    components: [row],
                });
            });

            collector.on('end', async () => {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('Précédent')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),

                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Suivant')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );

                await reply.edit({
                    components: [disabledRow],
                });
            });
            break;
        }

        case 'ranks': {
            const leaderboard = await getLeaderboardRanks(page);
        
            if(leaderboard.length === 0) return interaction.reply({
                embeds: [{
                    color: Colors.Blue,
                    description: `Il n'y a aucun membres dans le leaderboard.`
                }]
            });

            const leaderboardText = leaderboard.map((user, index) => {
                return `${index + 1 + (page - 1) * 10}. <@${user.userID}> - Niveau **${user.level}** \`(${user.experiences} XP)\``;
            }).join('\n');

            const embed = {
                color: Colors.Blue,
                title: `Leaderboard - Ranks`,
                description: leaderboardText,
                timestamp: new Date(),
                footer: {
                    text: `Page ${page}`,
                },
            };

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Précédent')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1),

                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Suivant')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(leaderboard.length < 10)
                );

            const reply = await interaction.reply({
                embeds: [embed],
                components: [row],
            });

            const filter = i => i.user.id === interaction.user.id;

            const collector = reply.createMessageComponentCollector({
                filter,
                time: 60000,
            });

            collector.on('collect', async i => {
                if (i.customId === 'prev') {
                    page--;
                } else if (i.customId === 'next') {
                    page++;
                }

                const leaderboard = await getLeaderboard(page, con);

                const embed = {
                    color: Colors.Blue,
                    title: `Leaderboard - Ranks`,
                    description: leaderboard.map((user, index) => {
                        return `${index + 1 + (page - 1) * 10}. <@${user.userID}> - Niveau **${user.level}** \`(${user.experiences} XP)\``;
                    }).join('\n'),
                    timestamp: new Date(),
                    footer: {
                        text: `Page ${page}`,
                    },
                };

                await i.update({
                    embeds: [embed],
                    components: [row],
                });
            });

            collector.on('end', async () => {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('Précédent')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),

                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Suivant')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );

                await reply.edit({
                    components: [disabledRow],
                });
            });
            break;
        }
    }

    async function getLeaderboardEconomy(page = 1) {
        return new Promise((resolve, reject) => {
            const itemsPerPage = 10;
            const offset = (page - 1) * itemsPerPage;

            try {
                con.query(`
                    SELECT userID, coins, inBank, crypto
                    FROM profile
                    ORDER BY coins DESC, crypto DESC
                    LIMIT ${itemsPerPage} OFFSET ${offset}
                `, function(err, result) {
                    return resolve(result)
                });
            } catch(error) {
                reject(error)
            }
        })
    }

    async function getLeaderboardRanks(page = 1) {
        return new Promise((resolve, reject) => {
            const itemsPerPage = 10;
            const offset = (page - 1) * itemsPerPage;

            try {
                con.query(`
                    SELECT userID, level, experiences
                    FROM profile
                    ORDER BY level DESC, experiences DESC
                    LIMIT ${itemsPerPage} OFFSET ${offset}
                `, function(err, result) {
                    return resolve(result)
                });
            } catch(error) {
                reject(error)
            }
        })
    }

    }
}