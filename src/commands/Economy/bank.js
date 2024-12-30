const { ApplicationCommandType, Colors, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js')

module.exports = {
    name: 'bank',
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
                    name: 'Deposit',
                    value: 'deposit'
                },
                {
                    name: 'Withdraw',
                    value: 'withdraw'
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
    const type = interaction.options.getString('type');
    const amount = interaction.options.getNumber('amount');

    switch(type) {
        case 'deposit': {
            con.query(`SELECT * FROM profile WHERE userID = '${interaction.user.id}'`, function(err, result) {
                if(amount > result[0].coins) return interaction.reply({ 
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous n'avez pas assez de coins à déposer.`
                    }]
                });

                let newCoins = (Number(result[0].coins) - Number(amount));
                let newInBank = (Number(result[0].inBank) + Number(amount));

                con.query(`UPDATE profile SET coins = ${newCoins}, inBank = '${newInBank}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                    return interaction.reply({
                        embeds: [{
                            color: Colors.Blue,
                            description: `Vous venez de déposer \`${amount}$\` dans votre compte en banque.`
                        }]
                    })
                })
            })
            break;
        }

        case 'withdraw': {
            con.query(`SELECT * FROM profile WHERE userID = '${interaction.user.id}'`, function(err, result) {
                if(amount > result[0].inBank) return interaction.reply({ 
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous n'avez pas assez de coins à déposer.`
                    }]
                });

                let newCoins = (Number(result[0].coins) + Number(amount));
                let newInBank = (Number(result[0].inBank) - Number(amount));

                con.query(`UPDATE profile SET coins = ${newCoins}, inBank = '${newInBank}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                    return interaction.reply({
                        embeds: [{
                            color: Colors.Blue,
                            description: `Vous venez de retirer \`${amount}$\` de votre compte en banque.`
                        }]
                    })
                })
            })
            break;
        }
    }
    }
}