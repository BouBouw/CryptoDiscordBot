const { ApplicationCommandType, Colors } = require('discord.js')

module.exports = {
    name: 'transactions',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    let array = [];

    con.query("SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 10", function(err, result) {
        result.forEach((transaction, index) => {
            switch(transaction.type) {
                case 'buy': {
                    break;
                }

                case '': {
                    break;
                }
            }
        })
    });

    }
}