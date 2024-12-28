const { ApplicationCommandType, EmbedBuilder, Colors } = require('discord.js')
const symbols = ["🍀", "💎", "💰", "🪙"];
const rewards = [
    { symbol: '💰', message: 'JACKPOT', amount: 500 },
    { symbol: '🍀', message: 'CHANCEUX', amount: 100 },
    { symbol: '💎', message: 'FANTASTIQUE', amount: 150 },
    { symbol: '🪙', message: 'RICHESSE', amount: 50 },
];

module.exports = {
    name: 'slot-machine',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    const randomSymbols = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    const [final1, final2, final3, final4, final5, final6, final7, final8, final9] = randomSymbols;

    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setDescription(`
            🟦 | ${final1} | ${final2} | ${final3} |
            ▶️ | ${final4} | ${final5} | ${final6} |
            🟦 | ${final7} | ${final8} | ${final9} |
        `);

    // Initial message
    await interaction.reply({
        content: `${interaction.user}, Lancement de la slot-machine...`,
        embeds: [embed],
    });

    // Vérification si une combinaison gagnante existe
    const winningCombo = rewards.find(reward => final4 === reward.symbol && final5 === reward.symbol && final6 === reward.symbol);

    if (winningCombo) {
        // Jackpot ou récompense
        const winMessage = `${interaction.user}, \n${winningCombo.message} ! Vous venez de recevoir **${winningCombo.amount} coins**`;

        await interaction.editReply({
            content: winMessage,
            embeds: [embed]
        });

        // Mise à jour des coins dans la base de données
        con.query(`UPDATE profile SET coins = coins + ? WHERE userID = ?`, [winningCombo.amount, interaction.user.id], (err, result) => {
            if (err) {
                console.error(err);
                return interaction.editReply('Une erreur est survenue lors de l\'update des coins.');
            }
            // Mise à jour des statistiques du jeu
            con.query(`SELECT gameWin, gameLoose FROM profile WHERE userID = ?`, [interaction.user.id], (err, result) => {
                if (err) {
                    console.error(err);
                    return interaction.editReply('Une erreur est survenue lors de la récupération des statistiques.');
                }

                let newGameWin = result[0].gameWin + 1;
                let newGameLoose = result[0].gameLoose;

                con.query(`UPDATE profile SET gameWin = ?, gameLoose = ? WHERE userID = ?`, [newGameWin, newGameLoose, interaction.user.id], (err, result) => {
                    if (err) {
                        console.error(err);
                        return interaction.editReply('Une erreur est survenue lors de la mise à jour des statistiques.');
                    }
                });
            });
        });

    } else {
        // Aucune combinaison gagnante
        await interaction.editReply({
            content: `${interaction.user}, \n**DOMMAGE** vous venez de perdre **15 coins**`,
            embeds: [embed]
        });

        // Déduction des coins
        con.query(`UPDATE profile SET coins = coins - 15 WHERE userID = ?`, [interaction.user.id], (err, result) => {
            if (err) {
                console.error(err);
                return interaction.editReply('Une erreur est survenue lors de l\'update des coins.');
            }

            // Mise à jour des statistiques du jeu (seulement les pertes)
            con.query(`SELECT gameWin, gameLoose FROM profile WHERE userID = ?`, [interaction.user.id], (err, result) => {
                if (err) {
                    console.error(err);
                    return interaction.editReply('Une erreur est survenue lors de la récupération des statistiques.');
                }

                let newGameWin = result[0].gameWin;
                let newGameLoose = result[0].gameLoose + 1;

                con.query(`UPDATE profile SET gameWin = ?, gameLoose = ? WHERE userID = ?`, [newGameWin, newGameLoose, interaction.user.id], (err, result) => {
                    if (err) {
                        console.error(err);
                        return interaction.editReply('Une erreur est survenue lors de la mise à jour des statistiques.');
                    }
                });
            });
        });
    }

    }
}