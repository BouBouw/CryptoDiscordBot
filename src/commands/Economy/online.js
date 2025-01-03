const { ApplicationCommandType, Colors, ApplicationCommandOptionType, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Games = require('../../../handlers/functions/Economy/Games');

function generateRandomUUID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}

const gameMapping = {
    0: "Quizz Battle",
    1: "Tic-Tac-Toe",
    2: "Duel de Mots",
    3: "Course de Dés",
    4: "Codenames",
    5: "Loup-Garou",
    6: "Pierre Papier Ciseaux"
}

const modeMapping = {
    0: "1 contre 1",
    1: "2 contre 2"
}

module.exports = {
    name: 'online',
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
                    name: 'Create',
                    value: 'create'
                },
                {
                    name: 'Join',
                    value: 'join'
                },
            ]
        },
    ],
execute: async (client, interaction, args, con) => {
    const type = interaction.options.getString('type');

    let gameSettings = {
        gameType: 0,
        gameInt: 0
    }

    switch(type) {
        case 'create': {
            interaction.reply({
                embeds: [{
                    color: Colors.Blue,
                    fields: [
                        {
                            name: `Jeux :`,
                            value: `Quizz Battle\nTic-Tac-Toe\nDuel de Mots\nCourse de Dés\nCodenames\nLoup-Garou\nPierre-Papier-Ciseaux`
                        }
                    ]
                }],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId('games_selector')
                        .setPlaceholder("Choisissez un jeu")
                        .addOptions(
                            new StringSelectMenuOptionBuilder()
                            .setLabel("Quizz Battle")
                            .setValue("quizz_battle")
                            .setDescription("Répondez vite à des questions pour gagner des points !"),
                            new StringSelectMenuOptionBuilder()
                            .setLabel("Tic Tac Toe")
                            .setValue("tic_tac_toe")
                            .setDescription("Remplissez une ligne en équipe sur une grille stratégique."),
                            new StringSelectMenuOptionBuilder()
                            .setLabel("Duel de Mots")
                            .setValue("words_battle")
                            .setDescription("Trouvez des mots en suivant la dernière lettre donnée."),
                            new StringSelectMenuOptionBuilder()
                            .setLabel("Course de Dés")
                            .setValue("dices_race")
                            .setDescription("Avancez sur le plateau en lançant les dés et atteignez l’arrivée !"),
                            new StringSelectMenuOptionBuilder()
                            .setLabel("Codenames")
                            .setValue("codenames")
                            .setDescription("Devinez des mots avec des indices donnés par votre coéquipier."),
                            new StringSelectMenuOptionBuilder()
                            .setLabel("Loup-Garou")
                            .setValue("wolf")
                            .setDescription("Déduisez, bluffez et survivez pour éliminer ou démasquer les Loups-Garous !"),
                            new StringSelectMenuOptionBuilder()
                            .setLabel("Pierre Papier Ciseaux")
                            .setValue("rock_paper_cisors")
                            .setDescription("Battez vos adversaires dans un tournoi classique."),
                        )
                    )
                ]
            }).then(async (msg) => {
                const filter = (i) => i.user.id === interaction.member.id && i.isStringSelectMenu();
                await Selects();

                async function Selects() {
                    let select;
                    
                    try {
                        select = await msg.awaitMessageComponent({ filter: filter });
                    } catch(error) {
                        if (err.code === "INTERACTION_COLLECTOR_ERROR") {
                            return msg.delete()
                        }
                    }
                    
                    if (!select.deffered) await select.deferUpdate();
                    
                    switch(select.values[0]) {
                        case 'tic_tac_toe': {
                            gameSettings.gameType = 1

                            msg.edit({
                                embeds: [{
                                    color: Colors.Blue,
                                    description: `Jeux en Ligne > **__${gameMapping[gameSettings.gameType]}__**`,
                                    fields: [
                                        {
                                            name: `Type de Jeu :`,
                                            value: `\`1\` contre \`1\`\n\`2\` contre \`2\``
                                        }
                                    ]
                                }],
                                components: [ 
                                    new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                        .setCustomId('1vs1')
                                        .setLabel("1 Contre 1")
                                        .setStyle(ButtonStyle.Secondary),
                                        new ButtonBuilder()
                                        .setCustomId('2vs2')
                                        .setLabel("2 Contre 2")
                                        .setStyle(ButtonStyle.Secondary),
                                    )
                                ]
                            }).then(async (m) => {
                                const filter = (i) => i.user.id === interaction.member.id && i.isButton();
                                await Buttons();
                    
                                async function Buttons() {
                                    let collected;
                    
                                    try {
                                        collected = await m.awaitMessageComponent({ filter: filter });
                                    } catch(error) {
                                        if (error.code === "INTERACTION_COLLECTOR_ERROR") {
                                            return m.delete()
                                        }
                                    }
                    
                                    if (!collected.deffered) await collected.deferUpdate();
                    
                                    switch(collected.customId) {
                                        case '1vs1': {
                                            gameSettings.gameInt = 0
                                            const uuid = generateRandomUUID();

                                            con.query(`INSERT INTO games_hosted (uuid, hostID, type, gameInt) VALUES ('${uuid}', '${interaction.user.id}', '${gameSettings.gameType}', '${gameSettings.gameInt}')`, function(err, result) {
                                                con.query(`CREATE TABLE games_${uuid} (id INT AUTO_INCREMENT PRIMARY KEY, userID VARCHAR(255), joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`, function(err, result) {
                                                    con.query(`INSERT INTO games_${(uuid).toLowerCase()} (userID) VALUES ('${interaction.user.id}')`, function(err, result) {
                                                        m.edit({
                                                            embeds: [{
                                                                color: Colors.Blue,
                                                                description: `Votre partie de **${gameMapping[gameSettings.gameType]}** vient d'être créer.`,
                                                                footer: {
                                                                    text: `Veuillez patienter en attendant un joueur...`
                                                                }
                                                            }],
                                                            components: []
                                                        })
                                                    })
                                                })
                                            })
                                            break;
                                        }

                                        case '2vs2': {
                                            gameSettings.gameInt = 1
                                            const uuid = generateRandomUUID();

                                            con.query(`INSERT INTO games_hosted (uuid, hostID, type, gameInt) VALUES ('${uuid}', '${interaction.user.id}', '${gameSettings.gameType}', '${gameSettings.gameInt}')`, function(err, result) {
                                                con.query(`CREATE TABLE games_${uuid} (id INT AUTO_INCREMENT PRIMARY KEY, userID VARCHAR(255), joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`, function(err, result) {
                                                    con.query(`INSERT INTO games_${(uuid).toLowerCase()} (userID) VALUES ('${interaction.user.id}')`, function(err, result) {
                                                        m.edit({
                                                            embeds: [{
                                                                color: Colors.Blue,
                                                                description: `Votre partie de **${gameMapping[gameSettings.gameType]}** vient d'être créer.`,
                                                                footer: {
                                                                    text: `Veuillez patienter en attendant un joueur...`
                                                                }
                                                            }],
                                                            components: []
                                                        })
                                                    })
                                                })
                                            })
                                            break;
                                        }
                                    }
                                }
                            })
                            break;
                        }
                        case 'rock_paper_cisors': {
                            gameSettings.gameType = 6

                            msg.edit({
                                embeds: [{
                                    color: Colors.Blue,
                                    description: `Jeux en Ligne > **__${gameMapping[gameSettings.gameType]}__**`,
                                    fields: [
                                        {
                                            name: `Type de Jeu :`,
                                            value: `\`1\` contre \`1\``
                                        }
                                    ]
                                }],
                                components: [ 
                                    new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                        .setCustomId('1vs1')
                                        .setLabel("1 Contre 1")
                                        .setStyle(ButtonStyle.Secondary)
                                    )
                                ]
                            }).then(async (m) => {
                                const filter = (i) => i.user.id === interaction.member.id && i.isButton();
                                await Buttons();
                    
                                async function Buttons() {
                                    let collected;
                    
                                    try {
                                        collected = await m.awaitMessageComponent({ filter: filter });
                                    } catch(error) {
                                        if (error.code === "INTERACTION_COLLECTOR_ERROR") {
                                            return m.delete()
                                        }
                                    }
                    
                                    if (!collected.deffered) await collected.deferUpdate();
                    
                                    switch(collected.customId) {
                                        case '1vs1': {
                                            gameSettings.gameInt = 0
                                            const uuid = generateRandomUUID();

                                            con.query(`INSERT INTO games_hosted (uuid, hostID, type, gameInt) VALUES ('${uuid}', '${interaction.user.id}', '${gameSettings.gameType}', '${gameSettings.gameInt}')`, function(err, result) {
                                                con.query(`CREATE TABLE games_${uuid} (id INT AUTO_INCREMENT PRIMARY KEY, userID VARCHAR(255), joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`, function(err, result) {
                                                    con.query(`INSERT INTO games_${(uuid).toLowerCase()} (userID) VALUES ('${interaction.user.id}')`, function(err, result) {
                                                        m.edit({
                                                            embeds: [{
                                                                color: Colors.Blue,
                                                                description: `Votre partie de **${gameMapping[gameSettings.gameType]}** vient d'être créer.`,
                                                                footer: {
                                                                    text: `Veuillez patienter en attendant un joueur...`
                                                                }
                                                            }],
                                                            components: []
                                                        })
                                                    })
                                                })
                                            })
                                            break;
                                        }
                                    }
                                }
                            })
                            break;
                        }
                    }
                }
            })
            /*
            con.query(`INSERT INTO games_hosted (hostID, type, gameInt) VALUES ('${interaction.user.id}', '', '')`, function(err, result) {

            })
            */
            break;
        }

        case 'join': {
            con.query(`SELECT * FROM games_hosted ORDER BY createdAt DESC`, function(err, result) {
                            const pageSize = 2;
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
                                    embed.setDescription('Aucune partie en ligne active.');
                                } else {
                                    embed.setDescription(
                                        pageData
                                            .map((entry, index) => 
                                                `\`#${start + index + 1}\` <@${entry.hostID}>\nCrée le: <t:${Math.floor(entry.createdAt / 1000)}:f>\n**Jeu:** ${gameMapping[entry.type]}\n**Mode:** ${modeMapping[entry.gameInt]}`)
                                            .join('\n\n')
                                    );
                                }
                
                                return embed;
                            }

                            function generateSelect(page) {
                                const start = page * pageSize;
                                const end = start + pageSize;
                                const pageData = result.slice(start, end);

                                const row = [];

                                if (pageData.length === 0) {
                                    row = []
                                } else {
                                    row.push(
                                        new ActionRowBuilder()
                                        .addComponents(
                                            new StringSelectMenuBuilder()
                                            .setCustomId('host_selector')
                                            .setPlaceholder("Choisissez une partie")
                                            .addOptions(
                                                pageData.map((entry, index) => {
                                                    const date = new Date(entry.createdAt);
                                                    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                                
                                                    return new StringSelectMenuOptionBuilder()
                                                        .setValue(entry.uuid)
                                                        .setLabel(`#${start + index + 1} - ${gameMapping[entry.type]}`)
                                                        .setDescription(`Créé le ${formattedDate} | Mode : ${modeMapping[entry.gameInt]}`);
                                                })
                                            )
                                        )
                                    )
                                }

                                return row;
                            }
                
                            interaction.reply({
                                embeds: [ generateEmbed(currentPage) ],
                                components: [
                                    generateSelect(currentPage)[0],
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
                                const filter_bis = (i) => i.user.id === interaction.member.id && i.isStringSelectMenu();

                                await Selects();
                                await Buttons();

                                async function Selects() {
                                    let collected;
            
                                    try {
                                        collected = await msg.awaitMessageComponent({ filter: filter_bis });
                                    } catch(error) {
                                        if (err.code === "INTERACTION_COLLECTOR_ERROR") {
                                            return msg.delete()
                                        }
                                    }

                                    if (!collected.deffered) await collected.deferUpdate();

                                    con.query(`SELECT * FROM games_hosted WHERE uuid = '${(collected.values[0]).toLowerCase()}'`, function(err, result) {
                                        const game = result[0];

                                        if(!result[0]) return interaction.channel.send({
                                            embeds: [{
                                                color: Colors.Blue,
                                                description: `La partie que vous essayez de rejoindre est indisponible.`
                                            }]
                                        });

                                        if(result[0].hostID === interaction.member.id) return interaction.channel.send({
                                            embeds: [{
                                                color: Colors.Blue,
                                                description: `Vous êtes déjà dans la partie. (\`host\`)`
                                            }]
                                        })

                                        con.query(`SELECT * FROM games_${(collected.values[0]).toLowerCase()} WHERE userID = '${interaction.member.id}'`, function(err, result) {
                                            if(!result[0]) {
                                                con.query(`INSERT INTO games_${(collected.values[0]).toLowerCase()} (userID) VALUES ('${interaction.user.id}')`, function(err, result) {
                                                    msg.edit({
                                                        embeds: [{
                                                            color: Colors.Blue,
                                                            description: `Vous venez de rejoindre la partie de <@${game.hostID}>`,
                                                            fields: [
                                                                {
                                                                    name: `${gameMapping[game.type]}`,
                                                                    value: `**Mode:** ${modeMapping[game.gameInt]}`
                                                                }
                                                            ]
                                                        }],
                                                        components: []
                                                    }).then(async () => {
                                                        await Games.checkGameStarting(collected.values[0], client, con, interaction.guild);
                                                    })
                                                })
                                            } else {
                                                return interaction.channel.send({
                                                    embeds: [{
                                                        color: Colors.Blue,
                                                        description: `Vous êtes déjà dans la partie. (\`joueur\`)`
                                                    }]
                                                })
                                            }
                                        })
                                    })
                                    
                                }
            
                                async function Buttons() {
                                    let collected;
            
                                    try {
                                        collected = await msg.awaitMessageComponent({ filter: filter });
                                    } catch(error) {
                                        if (error.code === "INTERACTION_COLLECTOR_ERROR") {
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