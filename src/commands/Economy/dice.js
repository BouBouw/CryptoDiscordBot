const { ApplicationCommandType, Colors, ApplicationCommandOptionType } = require('discord.js')

module.exports = {
    name: 'dice',
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

        const dice = Math.floor(Math.random() * 6) + 1;
        let newCoins;

        if(dice >= 4) {
            newCoins = (Number(result[0].coins) + Number(amount * 2));
            con.query(`UPDATE profile SET coins = '${newCoins}', gameTotal = '${(Number(result[0].gameTotal) + 1)}', gameWin = '${(Number(result[0].gameWin) + 1)}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous avez lancé un **${dice}** et gagner \`${Number(amount * 2)}$\`.`
                    }]
                })
            })
        } else {
            newCoins = (Number(result[0].coins) - Number(amount * 0.5));
            con.query(`UPDATE profile SET coins = '${newCoins}', gameTotal = '${(Number(result[0].gameTotal) + 1)}', gameLoose = '${(Number(result[0].gameLoose) + 1)}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous avez lancé un **${dice}** et perdu \`${Number(amount * 0.5)}$\`.`
                    }]
                })
            })
        }
    })

    }
}