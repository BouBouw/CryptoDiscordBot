const { Colors, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { connection } = require('../../../index.js');

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
                      gameLaunch(settings, users, client, con, guild)
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
                    description: `La partie va commencer...`,
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
            console.log(`Cannot send private message to : ${entry.userID}`)
        }
    });

    guild.channels.create({
        name: `game-${settings.uuid}`,
        type: ChannelType.GuildCategory
    }).then(async (category) => {
        await guild.channels.create({
            name: `salle-de-jeu`,
            topic: `${settings.uuid}`,
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
            gameManager(settings, channel, members, con)
        })
    })
}

function gameManager(settings, channel, members, con) {
    const gameHandlers = {
        0: startQuizzBattle,
        1: startTicTacToe,
        2: startDuelDeMots,
        3: startCourseDeDes,
        4: startCodenames,
        5: startLoupGarou,
        6: startRockPaperCisor
    };

    const handler = gameHandlers[settings.type];
    if(!handler) {
      return channel.send({ contnet: `Ce jeux n'est pas encore implémenté.` });
    }

    handler(channel, members, settings, con);  
  }

  // START : GAMES

  function startQuizzBattle(channel, members, settings) {
    channel.send("Bienvenue dans le Quizz Battle !");
    
    // Implémentation : Pose des questions, suivi des scores, etc.
  }

  // 2. Tic-Tac-Toe
  function startTicTacToe(channel, members, settings) {
    const mode = settings.gameInt; // Détermine le mode : "1v1" ou "2v2"
    const gridSize = mode === 0 ? 3 : 8; // Taille de la grille
    const symbolsToWin = mode === 0 ? 3 : 4; // Nombre de symboles nécessaires pour gagner
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

    const players = mode === 0
        ? members.map((member, index) => ({
            id: member.userID,
            symbol: index === 0 ? '❌' : '⭕',
        }))
        : members.map((member, index) => ({
            id: member.userID,
            symbol: index % 2 === 0 ? '❌' : '⭕', // Symboles alternants pour chaque équipe
        }));

    let currentPlayer = 0; // Index du joueur actuel

    function generateGrid() {
        const rows = grid.map((row, rowIndex) => {
            const actionRow = new ActionRowBuilder();
            row.forEach((cell, colIndex) => {
                actionRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`cell_${rowIndex}_${colIndex}`)
                        .setLabel(cell || '\u200b')
                        .setStyle(cell ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(Boolean(cell)) // Désactiver si la case est déjà jouée
                );
            });
            return actionRow;
        });
        return rows;
    }

    function checkWin(symbol) {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1], // Droite, Bas, Diagonale droite-bas, Diagonale gauche-bas
        ];

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (grid[row][col] !== symbol) continue;

                for (const [dx, dy] of directions) {
                    let count = 0;
                    for (let step = 0; step < symbolsToWin; step++) {
                        const x = row + dx * step;
                        const y = col + dy * step;
                        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || grid[x][y] !== symbol) break;
                        count++;
                    }
                    if (count === symbolsToWin) return true;
                }
            }
        }
        return false;
    }

    function isGridFull() {
        return grid.every(row => row.every(cell => cell !== null));
    }

    async function updateGridMessage(message) {
        await message.edit({
            content: `C'est au tour de <@${players[currentPlayer].id}> (${players[currentPlayer].symbol})`,
            components: generateGrid(),
        });
    }

    channel.send({
        content: `**Table créée en mode ${modeMapping[settings.gameInt]} :**\n\n${players.map((entry) => `<@${entry.id}> \`(${entry.symbol})\``).join('\n')}`,
        embeds: [{
            color: Colors.Blue,
            fields: [
                { name: `Joueurs :`, value: `${players.map((entry) => `<@${entry.id}> \`(${entry.symbol})\``).join('\n')}` },
            ]
        }]
    });

    channel.send({
        content: `La partie commence dans **10 secondes** !`,
    }).then((msg) => {
        setTimeout(async () => {
            await msg.delete();
            channel.send({
                content: `C'est au tour de <@${players[currentPlayer].id}> (${players[currentPlayer].symbol})`,
                components: generateGrid(),
            }).then((message) => {
                const collector = channel.createMessageComponentCollector({
                    filter: interaction => players.some(player => player.id === interaction.user.id),
                    time: 10 * 60 * 1000, // 10 minutes de temps limite
                });

                collector.on('collect', async (interaction) => {
                    const [_, row, col] = interaction.customId.split('_').map(Number);

                    if (interaction.user.id !== players[currentPlayer].id) {
                        await interaction.reply({
                            content: "Ce n'est pas votre tour !",
                            ephemeral: true,
                        });
                        return;
                    }

                    grid[row][col] = players[currentPlayer].symbol;

                    if (checkWin(players[currentPlayer].symbol)) {
                        collector.stop();
                        return channel.send({
                            embeds: [{
                                color: Colors.Green,
                                description: `🎉 Félicitations, <@${players[currentPlayer].id}> (${players[currentPlayer].symbol}) a gagné la partie !`,
                            }],
                        });
                    }

                    if (isGridFull()) {
                        collector.stop();
                        return channel.send({
                            embeds: [{
                                color: Colors.Orange,
                                description: "🤝 La partie se termine sur une égalité !",
                            }],
                        });
                    }

                    currentPlayer = (currentPlayer + 1) % players.length;

                    await interaction.deferUpdate();
                    updateGridMessage(message);
                });

                collector.on('end', (_, reason) => {
                    if (reason === 'time') {
                        channel.send({
                            embeds: [{
                                color: Colors.Red,
                                description: "⏳ Temps écoulé ! La partie a été annulée.",
                            }],
                        });
                    }
                });
            });
        }, 10000);
    });
}

  // 3. Duel de Mots
  function startDuelDeMots(channel, members, settings) {
    let currentPlayer = 0; // 0 pour le premier joueur, 1 pour le second
    const usedWords = new Set(); // Ensemble pour stocker les mots déjà utilisés
    let lastWord = ""; // Dernier mot joué
    const players = members.map((member) => ({
        id: member.userID,
        score: 0,
    }));

    // Fonction pour vérifier la validité d'un mot
    function isValidWord(word) {
        // Vérifiez si le mot est unique, commence par la dernière lettre du mot précédent et est valide
        return (
            (!lastWord || word[0].toLowerCase() === lastWord.slice(-1).toLowerCase()) &&
            !usedWords.has(word.toLowerCase()) &&
            /^[a-zA-Z]+$/.test(word) // Seulement des lettres
        );
    }

    // Fonction pour gérer le passage au joueur suivant
    function switchPlayer() {
        currentPlayer = (currentPlayer + 1) % 2;
        channel.send(`C'est au tour de <@${players[currentPlayer].id}> !`);
    }

    // Fonction pour terminer la partie
    function endGame(winnerIndex) {
        channel.send({
            embeds: [{
                color: Colors.Green,
                description: `🎉 Félicitations, <@${players[winnerIndex].id}> remporte le duel avec un score de **${players[winnerIndex].score}** !`,
            }],
        });
    }

    // Annonce du début du jeu
    channel.send({
        content: `🎮 **Duel de mots** commence ! C'est à <@${players[currentPlayer].id}> de jouer. Entrez un mot valide dans le chat.`,
    });

    // Collecteur pour les messages des joueurs
    const collector = channel.createMessageCollector({
        filter: (msg) => players.some(player => player.id === msg.author.id),
        time: 5 * 60 * 1000, // 5 minutes
    });

    // Événement déclenché lorsqu'un message est reçu
    collector.on('collect', (message) => {
        if (message.author.id !== players[currentPlayer].id) {
            message.reply("Ce n'est pas votre tour !");
            return;
        }

        const word = message.content.trim().toLowerCase();

        if (!isValidWord(word)) {
            message.reply(`Mot invalide ! Vous avez perdu. 🎯 Le mot doit commencer par **${lastWord ? lastWord.slice(-1).toUpperCase() : 'une lettre'}**, être unique et contenir uniquement des lettres.`);
            collector.stop(players[(currentPlayer + 1) % 2].id); // L'autre joueur gagne
            return;
        }

        // Si le mot est valide
        usedWords.add(word);
        lastWord = word;
        players[currentPlayer].score += 1; // Incrémenter le score
        message.reply(`✅ Mot accepté ! Score actuel : **${players[currentPlayer].score}**`);
        switchPlayer();
    });

    // Événement déclenché à la fin du collecteur
    collector.on('end', (_, reason) => {
        if (reason === 'time') {
            channel.send({
                embeds: [{
                    color: Colors.Orange,
                    description: "⏳ Temps écoulé ! Le duel se termine sans vainqueur.",
                }],
            });
        } else {
            const winnerIndex = players.findIndex(player => player.id === reason);
            endGame(winnerIndex);
        }
    });
  }

  // 4. Course de Dés
  function startCourseDeDes(channel, members, settings) {
      channel.send("Bienvenue à la Course de Dés !");
      // Implémentation : Lancer des dés, progression des joueurs, détection du gagnant.
  }

  // 5. Codenames
  function startCodenames(channel, members, settings) {
      channel.send("Bienvenue à Codenames !");
      // Implémentation : Distribution des cartes, tours d'indices, validation.
  }

  // 6. Loup-Garou
  function startLoupGarou(channel, members, settings) {
      channel.send("Bienvenue au Loup-Garou !");
      // Implémentation : Rôles, nuit/jour, gestion des votes, éliminations.
  }
  
  function startRockPaperCisor(channel, members, settings, con) {
    const participants = members.map((entry, index) => `\`#${index + 1}\` <@${entry.userID}>`).join('\n');
    const mentions = members.map((entry) => `<@${entry.userID}>`).join(', ');

    const match = {
      round: 0,
      1: { choice: null, points: 0 },
      2: { choice: null, points: 0 }
    };

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
        const statsMessage = initializeStats(thread, members, match);
        startGame(channel, thread, members, match, statsMessage, con);
      });
    });
  }

  // END : GAMES


  
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
    return new Promise(async (resolve, reject) => {
      try {
        const message = await statsMessage;
        message.edit({
          embeds: [{
            color: Colors.Blue,
            fields: [
              {
                name: `Statistiques :`,
                value: `${statsContent}`
              }
            ]
          }]
        })
        return resolve(message)
      } catch(error) {
        reject(error);
      }
    })
  }
  
  function startGame(channel, thread, members, match, statsMessage, con) {
    channel.send({
      content: `${members.map((entry) => `<@${entry.userID}>`).join(', ')}\nLa partie va commencer dans **10 secondes**.`
    }).then((msg) => {
      setTimeout(async () => {
        await msg.delete();
        channel.send({ content: `Un message vous mentionnant sera envoyé à chaque manche dans ce salon. (Interval: \`15 sec.\`)` });
        startNextRound(channel, thread, members, match, statsMessage, con);
      }, 10000);
    });
  }
  
  function startNextRound(channel, thread, members, match, statsMessage, con) {
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
  
    setTimeout(() => compareResults(thread, channel, members, match, statsMessage, con), 15000);
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
  
  function compareResults(thread, channel, members, match, statsMessage, con) {
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
      endGame(thread, members, match, statsMessage, con);
    } else {
      startNextRound(channel, thread, members, match, statsMessage);
    }
  }
  
  function endGame(thread, members, match, statsMessage, con) {
    const player1 = match[1];
    const player2 = match[2];
  
    let winnerMessage;
    if (player1.points > player2.points) {
      winnerMessage = `<@${members[0].userID}> remporte la partie avec ${player1.points} points contre ${player2.points} ! 🎉`;
  
      // Mise à jour pour le gagnant (Player 1)
      connection.query(
          `UPDATE profile SET coins = coins + 10, gameTotal = gameTotal + 1, gameWin = gameWin + 1 WHERE userID = '${members[0].userID}'`,
          function(err) {
              if (err) console.error(err);
          }
      );
  
      // Mise à jour pour le perdant (Player 2)
      connection.query(
          `UPDATE profile SET gameTotal = gameTotal + 1, gameLoose = gameLoose + 1 WHERE userID = '${members[1].userID}'`,
          function(err) {
              if (err) console.error(err);
          }
      );
  } else if (player2.points > player1.points) {
      winnerMessage = `<@${members[1].userID}> remporte la partie avec ${player2.points} points contre ${player1.points} ! 🎉`;
  
      // Mise à jour pour le gagnant (Player 2)
      connection.query(
          `UPDATE profile SET coins = coins + 10, gameTotal = gameTotal + 1, gameWin = gameWin + 1 WHERE userID = '${members[1].userID}'`,
          function(err) {
              if (err) console.error(err);
          }
      );
  
      // Mise à jour pour le perdant (Player 1)
      connection.query(
          `UPDATE profile SET gameTotal = gameTotal + 1, gameLoose = gameLoose + 1 WHERE userID = '${members[0].userID}'`,
          function(err) {
              if (err) console.error(err);
          }
      );
  } else {
      winnerMessage = "La partie se termine sur une égalité parfaite !";
  
      // Mise à jour pour les deux joueurs (égalité)
      members.forEach((member) => {
          connection.query(
              `UPDATE profile SET gameTotal = gameTotal + 1 WHERE userID = '${member.userID}'`,
              function(err) {
                  if (err) console.error(err);
              }
          );
      });
  }
  
    thread.send({ embeds: [{ color: Colors.Blue, description: winnerMessage }] });

    setTimeout(async () => {
      const channel = await thread.guild.channels.cache.get(thread.parentId);
      const cat = await channel.guild.channels.cache.get(channel.parentId);

      const uuid = channel.topic;

      await channel.delete();
      await cat.delete();
      
      connection.query(`DROP TABLE games_${(uuid).toLowerCase()}`, function(err, result) {
        if(err) throw err;

        connection.query(`DELETE FROM games_hosted WHERE uuid = '${uuid}'`, function(err, result) {
          if(err) throw err;
        })
      })
      
      // delete channel & database : in games_hosted & games_<uuid>
    }, 15000)
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