const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require('discord.js')

module.exports = {
    name: 'roulette',
    description: '(💡) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const amount = 10; // Montant à parier

        // Envoi du message avec les boutons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('red').setLabel('🔴 Rouge').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('black').setLabel('⚫ Noir').setStyle(ButtonStyle.Secondary)
            );

        const msg = await interaction.reply({
            content: `${interaction.user}, veuillez choisir entre **rouge** et **noir**`,
            embeds: [{
                color: Colors.Blue,
                description: 'Veuillez choisir entre **rouge** et **noir**',
                fields: [
                    { name: '`🔴` Rouge', value: 'Nombre impair', inline: true },
                    { name: '`⚫` Noir', value: 'Nombre pair', inline: true }
                ]
            }],
            components: [row],
        });

        // Filtre pour la réaction de l'utilisateur
        const filter = (interaction) => interaction.user.id === interaction.member.id && interaction.isButton();
        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (interaction) => {
            // Annuler la mise à jour de l'interface utilisateur si nécessaire
            if (!interaction.deferred) await interaction.deferUpdate();

            let selectedColor = interaction.customId;
            let isRed = selectedColor === 'red';

            // Logique du jeu
            let isWinner = Math.random() < 0.5;  // 50% de chance

            if (isRed ? !isWinner : isWinner) {
                // L'utilisateur a perdu
                await msg.edit({
                    content: ``,
                    embeds: [{
                        color: Colors.Blue,
                        description: `**MALHEUREUSEMENT**, la couleur ${selectedColor === 'red' ? 'rouge' : 'noir'} n'est pas gagnante. Vous avez perdu **${amount} coins**.`,
                    }],
                    components: []
                });

                // Soustraire les coins et mettre à jour les stats du jeu
                con.execute('UPDATE profile SET coins = coins - ? WHERE userID = ?', [amount, userId]);

            } else {
                // L'utilisateur a gagné
                await msg.edit({
                    content: ``,
                    embeds: [{
                        color: Colors.Blue,
                        description: `**HEUREUSEMENT**, la couleur ${selectedColor === 'red' ? 'rouge' : 'noir'} est gagnante. Vous avez gagné **${amount} coins**.`,
                    }],
                    components: []
                });

                // Ajouter les coins et mettre à jour les stats du jeu
                con.execute('UPDATE profile SET coins = coins + ? WHERE userID = ?', [amount, userId]);

            }

            // Mettre à jour les statistiques de jeu
            con.query(`SELECT * FROM profile WHERE userID = '${interaction.user.id}'`, function(err, result) {
                let newGameLoose = !isWinner ? result[0].gameLoose + 1 : result[0].gameLoose;
                let newGameWin = isWinner ? result[0].gameWin + 1 : result[0].gameWin;
                let newGameTotal = result[0].gameTotal + 1;
                con.query('UPDATE profile SET gameTotal = ?, gameLoose = ?, gameWin = ? WHERE userID = ?', [newGameTotal, newGameLoose, newGameWin, interaction.user.id]);
            })
        });

        collector.on('end', async () => {
            return;
        });
    }
}