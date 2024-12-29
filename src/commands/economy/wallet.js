const { ApplicationCommandType, Colors } = require('discord.js')

module.exports = {
    name: 'wallet',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    con.query(`SELECT * FROM profile WHERE userID = '${interaction.user.id}'`, function(err, result) {
        interaction.reply({
            embeds: [{
                color: Colors.Blue,
                title: `Wallet`,
                fields: [
                    {
                        name: `Coins`,
                        value: `${result[0].coins || 0}`,
                        inline: true
                    },
                    {
                        name: `En banque`,
                        value: `${result[0].inBank || 0}`,
                        inline: true
                    },
                    {
                        name: `Crypto`,
                        value: `${result[0].crypto || 0}`,
                        inline: true
                    },
                ]
            }]
        })
    });

    }
}