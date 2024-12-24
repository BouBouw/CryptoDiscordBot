const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: 'trade',
    description: '(💡) Economy',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "type",
            description: "Action of your interaction.",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Buy',
                    value: 'buy'
                },
                {
                    name: 'Sell',
                    value: 'remove'
                },
            ]
        },
        {
            name: "coins",
            description: "coins invest",
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    const type = interaction.options.getString('type');
    const coins = interaction.options.getNumber('coins');

    switch(type) {
        case 'buy': {
            const market = await getMarketStatus();
            const cryptoPrice = market.crypto_price;
            const remainingSupply = market.remaining_supply;
            const amount = coins / cryptoPrice;
        
            if (amount > remainingSupply) {
                console.log("Offre insuffisante pour l'achat.");
                return false;
            }

            con.query(`SELECT * FROM users WHERE userID = '${interaction.user.id}'`, function(err, result) {
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

                con.query(`UPDATE users SET coins = '${newCoins}' AND crypto = '${newCrypto}' WHERE userID = '${interaction.user.id}'`, function(err, result) {
                    if(err) throw err;
                });
                con.query(`UPDATE market SET remaining_supply = '${remainingSupply}' WHERE id = 1`, function(err, result) {});

                con.query(`INSERT INTO transactions (userID, type, amount, coins, price) VALUES ('${user.id}', 'buy', '${amount}', '${coins}', '${cryptoPrice}')`, function(err, result) {});
            
                const newPrice = cryptoPrice * (1 + 0.05 + (1 - remainingSupply / market.total_supply) * 0.1);
                con.query(`UPDATE market SET crypto_price = '${newPrice}' WHERE id = 1`, function(err, result) {});
            })

            console.log("Achat réussi !");
            break;
        }

        case 'sell': {
            const market = await getMarketStatus();
            const cryptoPrice = market.crypto_price;
            const coins = cryptoAmount * cryptoPrice;
        
            // Vérifier le solde de l'utilisateur
            con.query(`SELECT * FROM users WHERE userID = '${interaction.user.id}'`, function(err, result) {
                const user = result[0];
                console.log(user)

                if (user.length === 0 || user.crypto < cryptoAmount) {
                    console.log("Crypto insuffisante pour la vente.");
                    return false;
                }
            })
            const [user] = await connection
                .promise()
                .query("SELECT * FROM users WHERE username = ?", [username]);
        
            if (user.length === 0 || user[0].crypto < cryptoAmount) {
                console.log("Crypto insuffisante pour la vente.");
                return false;
            }
        
            // Mettre à jour les soldes utilisateur et le marché
            await db.query(
                "UPDATE users SET crypto = crypto - ?, coins = coins + ? WHERE username = ?",
                [cryptoAmount, coins, username]
            );
        
            await db.promise().query(
                "UPDATE market SET remaining_supply = remaining_supply + ? WHERE id = 1",
                [cryptoAmount]
            );
        
            // Enregistrer la transaction
            await db.promise().query(
                "INSERT INTO transactions (user_id, type, amount, coins, price) VALUES (?, 'sell', ?, ?, ?)",
                [user[0].id, cryptoAmount, coins, cryptoPrice]
            );
        
            // Réajuster le prix
            const newPrice =
                cryptoPrice * (1 + this.profitabilityRate - (cryptoAmount / market.total_supply) * 0.1);
            await db.promise().query(
                "UPDATE market SET crypto_price = ? WHERE id = 1",
                [newPrice]
            );
        
            console.log("Vente réussie !");
            return true;
            break;
        }
    }

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