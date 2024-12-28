const { ApplicationCommandType, Colors } = require('discord.js');
const ms = require("parse-ms");

module.exports = {
    name: 'daily',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const timeout = 86400000; // 24 heures en millisecondes
        const amount = 150;

        // Récupérer la dernière réclamation dans la base de données
        con.query('SELECT * FROM profile WHERE userID = ?', [userId], async (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des données:', err);
                return interaction.reply({ content: 'Une erreur est survenue. Veuillez réessayer.', ephemeral: true });
            }

            if (results.length > 0) {
                const lastClaimTimestamp = results[0].last_claim_timestamp;
                const coins = results[0].coins;

                const timeRemaining = timeout - (Date.now() - new Date(lastClaimTimestamp).getTime());

                if (timeRemaining > 0) {
                    const time = ms(timeRemaining);
                    return interaction.reply({
                        embeds: [{
                            color: Colors.Blue,
                            description: `Vous devez attendre encore **${time.hours}** heure(s), **${time.minutes}** minute(s) et **${time.seconds}** seconde(s) avant de pouvoir réclamer votre récompense quotidienne.`
                        }]
                    });
                } else {
                    con.query('UPDATE profile SET coins = ?, last_claim_timestamp = ? WHERE userID = ?', [coins + amount, new Date(), userId], (err) => {
                        if (err) {
                            console.error('Erreur lors de l\'update des données:', err);
                            return interaction.reply({ content: 'Une erreur est survenue. Veuillez réessayer.', ephemeral: true });
                        }
                        return interaction.reply({
                            embeds: [{
                                color: Colors.Blue,
                                description: `Vous venez de récupérer vos **${amount} coins** journaliers! Vous avez maintenant **${coins + amount} coins**.`
                            }]
                        });
                    });
                }
            } else {
                con.query('INSERT INTO profile (userID, coins, last_claim_timestamp) VALUES (?, ?, ?)', [userId, amount, new Date()], (err) => {
                    if (err) {
                        console.error('Erreur lors de l\'insertion des données:', err);
                        return interaction.reply({ content: 'Une erreur est survenue. Veuillez réessayer.', ephemeral: true });
                    }
                    return interaction.reply({
                        embeds: [{
                            color: Colors.Blue,
                            description: `Vous venez de récupérer vos **${amount} coins** journaliers!`
                        }] 
                    });
                });
            }
        });
    }
}