const { ApplicationCommandType, Colors, ApplicationCommandOptionType } = require('discord.js')

module.exports = {
    name: 'sell',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "amount",
            description: "Crypto Amount",
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    const cryptoAmount = interaction.options.getNumber('amount');

    const market = await getMarketStatus();
            const cryptoPrice = market.crypto_price;
            const remainingSupply = market.remaining_supply;
            const coins = cryptoAmount * cryptoPrice;
        
            // Vérifier le solde de l'utilisateur
            con.query(`SELECT * FROM profile WHERE userID = '${interaction.user.id}'`, function(err, result) {
                const user = result[0];
                console.log(user)

                if (user.length === 0 || user.crypto < cryptoAmount) {
                    console.log("Crypto insuffisante pour la vente.");
                    return false;
                }

                let newCoins = (Number(user.coins) + Number(coins));
                console.log(newCoins)

                let newCrypto = (Number(user.crypto) - Number(cryptoAmount));
                console.log(newCrypto)

                con.query(`UPDATE profile SET coins = '${newCoins}', crypto = '${newCrypto}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                    if(err) throw err;
                });

                con.query(`UPDATE market SET remaining_supply = '${(Number(remainingSupply) - cryptoAmount)}' WHERE id = '1'`, function(err, result) {
                    console.log(remainingSupply)
                });

                con.query(`INSERT INTO transactions (userID, type, amount, coins, price) VALUES ('${user.id}', 'sell', '${cryptoAmount}', '${coins}', '${cryptoPrice}')`, function(err, result) {});

                const newPrice = cryptoPrice * (1 + 0.05 - (cryptoAmount / market.total_supply) * 0.1);
                con.query(`UPDATE market SET crypto_price = '${newPrice}' WHERE id = 1`, function(err, result) {});

                interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous venez de vendre ${cryptoAmount} (\`${coins}\`) crypto-monnaie.`
                    }]
                })
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