const {connection} = require('../../../index');

const getMarketStatus = async () => {
    const [rows] = await connection.query("SELECT * FROM market LIMIT 1");
    return rows[0]
};

const buyCrypto = async (userID, coins) => {
    const market = await getMarketStatus();
    const cryptoPrice = market.crypto_price;
    const remainingSupply = market.remaining_supply;
    const amount = coins / cryptoPrice;

    if (amount > remainingSupply) {
        console.log("Offre insuffisante pour l'achat.");
        return false;
    }

    // Vérifier le solde de l'utilisateur
    const [user] = await connection
        .promise()
        .query("SELECT * FROM users WHERE username = ?", [username]);

    if (user.length === 0 || user[0].coins < coins) {
        console.log("Solde insuffisant.");
        return false;
    }

    // Mettre à jour les soldes utilisateur et le marché
    await connection.promise().query(
        "UPDATE users SET coins = coins - ?, crypto = crypto + ? WHERE username = ?",
        [coins, amount, username]
    );

    await connection.promise().query(
        "UPDATE market SET remaining_supply = remaining_supply - ? WHERE id = 1",
        [amount]
    );

    // Enregistrer la transaction
    await connection.promise().query(
        "INSERT INTO transactions (user_id, type, amount, coins, price) VALUES (?, 'buy', ?, ?, ?)",
        [user[0].id, amount, coins, cryptoPrice]
    );

    // Réajuster le prix
    const newPrice =
        cryptoPrice * (1 + 0.05 + (1 - remainingSupply / market.total_supply) * 0.1);
    await connection.promise().query(
        "UPDATE market SET crypto_price = ? WHERE id = 1",
        [newPrice]
    );

    console.log("Achat réussi !");
    return true;
}

const sellCrypto = async (userID, amount) => {
    const market = await getMarketStatus();
    const cryptoPrice = market.crypto_price;
    const coins = cryptoAmount * cryptoPrice;

    // Vérifier le solde de l'utilisateur
    const [user] = await connection
        .promise()
        .query("SELECT * FROM users WHERE username = ?", [username]);

    if (user.length === 0 || user[0].crypto < cryptoAmount) {
        console.log("Crypto insuffisante pour la vente.");
        return false;
    }

    // Mettre à jour les soldes utilisateur et le marché
    await db.promise().query(
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
}

const displayTransactions = async () => {
    const [rows] = await db.promise().query("SELECT * FROM transactions");
    console.log("Historique des transactions :", rows);
}

const Exchange = {
    getMarketStatus,
    buyCrypto,
    sellCrypto,
    displayTransactions
}

module.exports = Exchange;