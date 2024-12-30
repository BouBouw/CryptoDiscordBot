const { Colors, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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

const checkGameStarting = (uuid, client, con, guild) => {
    con.query(`SELECT * FROM games_hosted WHERE uuid = '${uuid}'`, function(err, result) {
        const settings = result[0];
        console.log(settings)
        con.query(`SELECT * FROM games_${(settings.uuid).toLowerCase()}`, function(err, result) {
            const users = result;

            switch(settings.gameInt) {
                case 0: {
                    if(users.length === 2) {
                        gameLaunch(settings, users, client, con, guild)
                    }
                    break;
                }

                case 1: {
                    if(users.length === 4) {
                        // launch
                    }
                    break;
                }
            }
        })
    })
}

const gameLaunch = (settings, members, client, con, guild) => {
    const arr = [];
    members.forEach(async (u) => {
        const m = await guild.members.fetch(u.userID);
        if(m) arr.push(m.user.id);
    })

    members.map(async (entry, index) => {
        const user = await client.users.cache.get(entry.userID) || guild.members.cache.get(entry.userID);
        try {
            if(!user) return;
            user.send({
                embeds: [{
                    color: Colors.Blue,
                    description: `La partie commence dans 2 minutes...`,
                    fields: [
                        {
                            name: `${gameMapping[settings.type]}`,
                            value: `**Mode:** ${modeMapping[settings.gameInt]}`
                        },
                        {
                            name: `Adversaire :`,
                            value: `<@${members[index === 0 ? 1 : 0].userID}>`
                        }
                    ]
                }]
            })
        } catch(error) {
            console.log('cannot send')
        }
    });

    guild.channels.create({
        name: `game-${settings.uuid}`,
        type: ChannelType.GuildCategory
    }).then(async (category) => {
        await console.log(arr.join(', '))

        await guild.channels.create({
            name: `salle-de-jeu`,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                ...arr.map((userId) => ({
                    id: userId,
                    allow: [PermissionFlagsBits.ViewChannel],
                }))
            ]
        }).then(async (channel) => {
            gameManager(settings, channel, members)
        })
    })
}

function gameManager(settings, channel, members) {
    if (settings.type !== 6) return;
  
    const participants = members.map((entry, index) => `\`#${index + 1}\` <@${entry.userID}>`).join('\n');
    const mentions = members.map((entry) => `<@${entry.userID}>`).join(', ');
  
    channel.send({
      content: `**Table créée :**\n\n${mentions}`,
      embeds: [{
        color: Colors.Blue,
        fields: [
          { name: `${gameMapping[settings.type]}`, value: `\u200b` },
          { name: `Joueurs :`, value: `${participants}` }
        ]
      }]
    }).then(() => {
      channel.threads.create({
        name: `historique`,
        autoArchiveDuration: 60,
        reason: `Game ID : ${settings.uuid}`
      }).then((thread) => {
        let match = {
          round: 0,
          1: { choice: null, points: 0 },
          2: { choice: null, points: 0 }
        };
  
        const statsMessage = initializeStats(thread, members, match);
        startGame(channel, thread, members, match, statsMessage);
      });
    });
  }
  
  function initializeStats(thread, members, match) {
    const statsContent = generateStatsContent(members, match);
    return thread.send({
      embeds: [{
        color: Colors.Blue,
        fields: [
          { name: `Statistiques :`, value: statsContent }
        ]
      }]
    });
  }
  
  function generateStatsContent(members, match) {
    return `Round : ${match.round}\n\n` + 
           members.map((entry, index) => 
             `\`#${index + 1}\` <@${entry.userID}> : ${match[index + 1].points} points`
           ).join('\n');
  }
  
  function updateStatsMessage(statsMessage, members, match) {
    const statsContent = generateStatsContent(members, match);
    statsMessage.edit({
      embeds: [{
        color: Colors.Blue,
        fields: [
          { name: `Statistiques :`, value: statsContent }
        ]
      }]
    });
  }
  
  function startGame(channel, thread, members, match, statsMessage) {
    channel.send({
      content: `${members.map((entry) => `<@${entry.userID}>`).join(', ')}\nLa partie va commencer dans **10 secondes**.`
    }).then((msg) => {
      setTimeout(async () => {
        await msg.delete();
        channel.send({ content: `Un message vous mentionnant sera envoyé à chaque manche dans ce salon. (Interval: \`30 sec.\`)` });
        startNextRound(channel, thread, members, match, statsMessage);
      }, 10000);
    });
  }
  
  function startNextRound(channel, thread, members, match, statsMessage) {
    match.round += 1;
  
    members.forEach((entry) => {
      channel.send({
        content: `<@${entry.userID}>`,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rock').setLabel('Pierre').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('paper').setLabel('Papier').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('cisor').setLabel('Ciseaux').setStyle(ButtonStyle.Secondary)
          )
        ]
      }).then((message) => handlePlayerChoice(message, entry, match));
    });
  
    setTimeout(() => compareResults(thread, members, match, statsMessage), 30000);
  }
  
  async function handlePlayerChoice(message, entry, match) {
    const filter = (i) => i.user.id === entry.userID && i.isButton();
    try {
      const interaction = await message.awaitMessageComponent({ filter });
      await interaction.deferUpdate();
  
      match[entry.id].choice = interaction.customId;
      await message.delete();
    } catch {
      await message.delete();
    }
  }
  
  function compareResults(thread, members, match, statsMessage) {
    const player1 = match[1];
    const player2 = match[2];
  
    if (!player1.choice || !player2.choice) {
      thread.send("Un ou plusieurs joueurs n'ont pas fait leur choix dans le temps imparti.");
      return;
    }
  
    const result = getWinner(player1.choice, player2.choice);
  
    if (result === 1) {
      player1.points += 1;
      thread.send(`<@${members[0].userID}> gagne ce tour !`);
    } else if (result === 2) {
      player2.points += 1;
      thread.send(`<@${members[1].userID}> gagne ce tour !`);
    } else {
      thread.send("Égalité !");
    }
  
    updateStatsMessage(statsMessage, members, match);
  
    if (match.round === 3) {
      endGame(thread, members, match, statsMessage);
    } else {
      startNextRound(thread.channel, thread, members, match, statsMessage);
    }
  }
  
  function endGame(thread, members, match, statsMessage) {
    const player1 = match[1];
    const player2 = match[2];
  
    let winnerMessage;
    if (player1.points > player2.points) {
      winnerMessage = `<@${members[0].userID}> remporte la partie avec ${player1.points} points contre ${player2.points} ! 🎉`;
    } else if (player2.points > player1.points) {
      winnerMessage = `<@${members[1].userID}> remporte la partie avec ${player2.points} points contre ${player1.points} ! 🎉`;
    } else {
      winnerMessage = "La partie se termine sur une égalité parfaite !";
    }
  
    thread.send({ embeds: [{ color: Colors.Green, description: winnerMessage }] });
    statsMessage.edit({ content: "La partie est terminée.", embeds: [] });
  }
  
  function getWinner(choice1, choice2) {
    if (choice1 === choice2) return 0;
    if (
      (choice1 === 'rock' && choice2 === 'cisor') ||
      (choice1 === 'paper' && choice2 === 'rock') ||
      (choice1 === 'cisor' && choice2 === 'paper')
    ) {
      return 1;
    }
    return 2;
  }
  
  

const Games = {
    checkGameStarting
}

module.exports = Games;