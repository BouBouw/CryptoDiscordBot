const { ApplicationCommandType, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    name: 'transactions',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    let page = 1;
    let array = [];

    const transactions = await getTransactions(page);
    if(transactions.length === 0) return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: `Il n'y a aucune transactions.`
        }]
    })

    const transactionsText = transactions.map((transaction, index) => {
        return `${index + 1 + (page - 1) * 10}. [${transaction.type === 'buy' ? '↖' : '↘'}] <@${transaction.userID}> - **Montant**: ${transaction.amount} - ${transaction.coins} | **Date**: ${new Date(transaction.timestamp).toLocaleString()}`;
    }).join('\n');

    const embed = {
        color: Colors.Blue,
        title: `Transactions - Page ${page}`,
        description: transactionsText,
        timestamp: new Date(),
        footer: {
            text: `Page ${page}`,
        },
    };

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('Précédent')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 1),

            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Suivant')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(transactions.length < 10)
        );

    const reply = await interaction.reply({
        embeds: [embed],
        components: [row],
    });

    const filter = i => i.user.id === interaction.user.id;

    const collector = reply.createMessageComponentCollector({
        filter,
        time: 60000,
    });

    collector.on('collect', async i => {
        if (i.customId === 'prev') {
            page--;
        } else if (i.customId === 'next') {
            page++;
        }

        const transactions = await getTransactions(page);

        const embed = {
            color: Colors.Blue,
            title: `Transactions - Page ${page}`,
            description: transactions.map((transaction, index) => {
                return `${index + 1 + (page - 1) * 10}. **ID**: ${transaction.id} | **Utilisateur**: ${transaction.user_id} | **Montant**: ${transaction.amount} | **Date**: ${new Date(transaction.timestamp).toLocaleString()}`;
            }).join('\n'),
            timestamp: new Date(),
            footer: {
                text: `Page ${page}`,
            },
        };

        await i.update({
            embeds: [embed],
            components: [row],
        });
    });

    collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Précédent')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Suivant')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            );

        await reply.edit({
            components: [disabledRow],
        });
    });

    async function getTransactions(page = 1) {
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;

        return new Promise((resolve, reject) => {
            try {
                con.query(`
                    SELECT * FROM transactions
                    ORDER BY timestamp DESC
                    LIMIT ${itemsPerPage} OFFSET ${offset}
                `, function(err, result) {
                    resolve(result);
                })
            } catch(error) {
                reject(error)
            }
        })
    }

    }
}