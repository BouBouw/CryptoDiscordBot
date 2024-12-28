const { ApplicationCommandType, Colors } = require('discord.js')

module.exports = {
    name: 'market',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    con.query(`SELECT * FROM market WHERE id = '1'`, function(err, result) {
        interaction.reply({
            embeds: [{
                color: Colors.Blue,
                title: `Market`,
                fields: [
                    {
                        name: `Crypto`,
                        value: `${result[0].crypto_price || 0}`,
                        inline: true
                    },
                    {
                        name: `Total`,
                        value: `${(Number(result[0].total_supply) - Number(result[0].remaining_supply)) || 0}`,
                        inline: true
                    },
                ]
            }]
        })
    });

    }
}