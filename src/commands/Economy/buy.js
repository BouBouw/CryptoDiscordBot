const { ApplicationCommandType, Colors, ApplicationCommandOptionType } = require('discord.js')

module.exports = {
    name: 'buy',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "coins",
            description: "coins invest",
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    const coins = interaction.options.getNumber('coins');

    const market = await getMarketStatus();
            const cryptoPrice = market.crypto_price;
            const remainingSupply = market.remaining_supply;
            const amount = coins / cryptoPrice;
        
            if (amount > remainingSupply) {
                console.log("Offre insuffisante pour l'achat.");
                return false;
            }

            con.query(`SELECT * FROM profile WHERE userID = '${interaction.user.id}'`, function(err, result) {
                const user = result[0];
                console.log(user)

                if(user.length === 0 || user.coins < coins) {
                    console.log("Solde insuffisant.");
                    return false;
                }

                let newCoins = (Number(user.coins) - Number(coins));
                console.log(newCoins)

                let newCrypto = (Number(user.crypto) + Number(amount));
                console.log(newCrypto)

                con.query(`UPDATE profile SET coins = '${newCoins}', crypto = '${newCrypto}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                    if(err) throw err;
                });

                let newTotalSupply = (Number(market.total_supply) + Number(amount));
                console.log(newTotalSupply);

                con.query(`UPDATE market SET remaining_supply = '${(Number(remainingSupply) - amount)}' WHERE id = '1'`, function(err, result) {
                    console.log(remainingSupply)
                });

                con.query(`INSERT INTO transactions (userID, type, amount, coins, price) VALUES ('${user.id}', 'buy', '${amount}', '${coins}', '${cryptoPrice}')`, function(err, result) {});
            
                const newPrice = cryptoPrice * (1 + 0.05 + (1 - remainingSupply / market.total_supply) * 0.1);
                con.query(`UPDATE market SET crypto_price = '${newPrice}' WHERE id = 1`, function(err, result) {});
            })

            interaction.reply({
                embeds: [{
                    color: Colors.Blue,
                    description: `Vous venez d'acheter ${amount} (\`${coins}\`) crypto-monnaie.`
                }]
            })

            function getMarketStatus() {
                return new Promise((resolve, reject) => {
                    try {
                        con.query("SELECT * FROM market LIMIT 1", function(err, result) {
                            return resolve(result[0])
                        });
                    } catch(err) {
                        reject(err)
                    }
                })  
            }
    }
}