const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ApplicationCommandOptionType } = require('discord.js')

module.exports = {
    name: 'roulette',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "choice",
            description: "Choice color",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Red',
                    value: 'red'
                },
                {
                    name: 'Black',
                    value: 'black'
                },
                {
                    name: 'Green',
                    value: 'green'
                },
            ]
        },
        {
            name: "amount",
            description: "Amount",
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    const choice = interaction.options.getString('choice');
    const amount = interaction.options.getNumber('amount');

    con.query(`SELECT * FROM profile WHERE userID = '${interaction.user.id}'`, function(err, result) {
        if(amount > result[0].coins) return interaction.reply({
            embeds: [{
                color: Colors.Blue,
                description: `Vous n'avez pas assez de coins pour miser.`
            }]
        });

        const results = Math.random();
        const winMultiplier = choice === 'green' ? 14 : 2;
        const isWin =
            (choice === 'red' && results < 0.48) ||
            (choice === 'black' && results >= 0.48 && results < 0.96) ||
            (choice === 'green' && results >= 0.96);

        let newCoins;

        if(isWin) {
            newCoins = (Number(result[0].coins) + Number(amount * winMultiplier));
            con.query(`UPDATE profile SET coins = '${newCoins}', gameTotal = '${(Number(result[0].gameTotal) + 1)}', gameWin = '${(Number(result[0].gameWin) + 1)}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `La roulette a donné **${choice}**. Vous avez gagné \`${Number(amount * winMultiplier)}$\`.`
                    }]
                })
            })
        } else {
            newCoins = (Number(result[0].coins) - Number(amount * 0.5));
            con.query(`UPDATE profile SET coins = '${newCoins}', gameTotal = '${(Number(result[0].gameTotal) + 1)}', gameLoose = '${(Number(result[0].gameLoose) + 1)}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `La roulette a donné **${choice}**. Vous avez gagné \`${Number(amount * 0.5)}$\`.`
                    }]
                })
            })
        }
    })

    }
}