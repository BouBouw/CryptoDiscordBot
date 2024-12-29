const { ApplicationCommandType, Colors, ApplicationCommandOptionType } = require('discord.js')

module.exports = {
    name: 'blackjack',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "amount",
            description: "Amount",
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    const amount = interaction.options.getNumber('amount');

    con.query(`SELECT * FROM profile WHERE userID = '${interaction.user.id}'`, function(err, result) {
        if(amount > result[0].coins) return interaction.reply({
            embeds: [{
                color: Colors.Blue,
                description: `Vous n'avez pas assez de coins pour miser.`
            }]
        });

        const playerCard = Math.floor(Math.random() * 11) + 1; // Carte joueur (1-11)
        const botCard = Math.floor(Math.random() * 11) + 1; // Carte bot (1-11)

        let newCoins;

        if(playerCard > botCard) {
            newCoins = (Number(result[0].coins) + Number(amount * 2));
            con.query(`UPDATE profile SET coins = '${newCoins}', gameTotal = '${(Number(result[0].gameTotal) + 1)}', gameWin = '${(Number(result[0].gameWin) + 1)}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous avez gagné ! Votre carte: \`${playerCard}\`, carte de l'adversaire: \`${botCard}\`.`
                    }]
                })
            })
        } else if(playerCard < botCard) {
            newCoins = (Number(result[0].coins) - Number(amount * 0.5));
            con.query(`UPDATE profile SET coins = '${newCoins}', gameTotal = '${(Number(result[0].gameTotal) + 1)}', gameLoose = '${(Number(result[0].gameLoose) + 1)}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous avez perdu ! Votre carte: \`${playerCard}\`, carte de l'adversaire: \`${botCard}\`.`
                    }]
                })
            })
        }  else {
            con.query(`UPDATE profile SET gameTotal = '${(Number(result[0].gameTotal) + 1)}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Egalité ! Votre carte: \`${playerCard}\`, carte de l'adversaire: \`${botCard}\`.`
                    }]
                })
            })
        }
    })

    }
}