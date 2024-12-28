const { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: 'embeds',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "channel",
            description: "Channel",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        }
    ],
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.followUp({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    const channel = interaction.options.getChannel('channel') || interaction.channel;

    let embed = new EmbedBuilder()
            .setDescription(':hourglass_flowing_sand: Création d\'un embed en cours...')
            .setColor('#0099ff');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('author')
                    .setLabel('👤 Modifier l\'auteur')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('title')
                    .setLabel('📌 Modifier le titre')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('url')
                    .setLabel('🌐 Ajouter un URL')
                    .setStyle(ButtonStyle.Primary),
            );

        const row_1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('description')
                    .setLabel('📰 Modifier la description')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('addField')
                    .setLabel('📝 Ajouter une ligne')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('image')
                    .setLabel('🖼️ Ajouter une image')
                    .setStyle(ButtonStyle.Primary),
            );

        const row_2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('footer')
                    .setLabel('🔻 Modifier le bas de page')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('colors')
                    .setLabel('🌈 Modifier la couleur')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('send')
                    .setLabel('✅ Envoyer l\'embed')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('❌ Annuler')
                    .setStyle(ButtonStyle.Danger),
            );

        // Envoyer un message avec l'embed et les boutons
        await interaction.reply({ embeds: [embed], components: [row, row_1, row_2] });

        // Créer un collecteur pour les interactions avec les boutons
        const filter = (buttonInteraction) => buttonInteraction.user.id === interaction.user.id && buttonInteraction.isButton();

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30_000 });

        collector.on('collect', async (buttonInteraction) => {
            // Empêcher les interactions répétées sur les boutons
           //  if (!buttonInteraction.deferred) await buttonInteraction.deferUpdate();

            switch (buttonInteraction.customId) {
                case 'author': {
                    console.log(buttonInteraction)
                    const question = await buttonInteraction.reply({ content: ':hourglass_flowing_sand: Quel auteur voulez-vous attribuer à l\'embed?', fetchReply: true });
                    const response = await buttonInteraction.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                    const author = response.first()?.content;
                    if (author) {
                        embed.setAuthor({ name: author });
                        await question.delete();
                        await buttonInteraction.message.edit({ embeds: [embed] });
                    }
                    break;
                }

                case 'title': {
                    const question = await buttonInteraction.reply({ content: ':hourglass_flowing_sand: Quel titre voulez-vous attribuer à l\'embed?', fetchReply: true });
                    const response = await buttonInteraction.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                    const title = response.first()?.content;
                    if (title) {
                        embed.setTitle(title);
                        await question.delete();
                        await buttonInteraction.editReply({ embeds: [embed] });
                    }
                    break;
                }

                case 'url': {
                    const question = await buttonInteraction.reply({ content: ':hourglass_flowing_sand: Quel URL voulez-vous attribuer à l\'embed?', fetchReply: true });
                    const response = await buttonInteraction.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                    const url = response.first()?.content;
                    if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
                        embed.setURL(url);
                        await question.delete();
                        await buttonInteraction.editReply({ embeds: [embed] });
                    } else {
                        await buttonInteraction.followUp({ content: ':x: URL invalide.', ephemeral: true });
                    }
                    break;
                }

                case 'description': {
                    const question = await buttonInteraction.reply({ content: ':hourglass_flowing_sand: Quelle description voulez-vous attribuer à l\'embed?', fetchReply: true });
                    const response = await buttonInteraction.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                    const description = response.first()?.content;
                    if (description) {
                        embed.setDescription(description);
                        await question.delete();
                        await buttonInteraction.editReply({ embeds: [embed] });
                    }
                    break;
                }

                case 'addField': {
                    const question1 = await buttonInteraction.reply({ content: ':hourglass_flowing_sand: Quel titre voulez-vous ajouter?', fetchReply: true });
                    const response1 = await buttonInteraction.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                    const titleField = response1.first()?.content;
                    if (titleField) {
                        const question2 = await buttonInteraction.followUp({ content: ':hourglass_flowing_sand: Quelle description voulez-vous ajouter?', fetchReply: true });
                        const response2 = await buttonInteraction.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                        const descriptionField = response2.first()?.content;
                        if (descriptionField) {
                            embed.addFields({ name: titleField, value: descriptionField });
                            await question2.delete();
                            await buttonInteraction.editReply({ embeds: [embed] });
                        }
                    }
                    break;
                }

                case 'image': {
                    const question = await buttonInteraction.reply({ content: ':hourglass_flowing_sand: Quelle image voulez-vous ajouter?', fetchReply: true });
                    const response = await buttonInteraction.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                    const imageUrl = response.first()?.content;
                    if (imageUrl) {
                        embed.setImage(imageUrl);
                        await question.delete();
                        await buttonInteraction.editReply({ embeds: [embed] });
                    }
                    break;
                }

                case 'footer': {
                    const question = await buttonInteraction.reply({ content: ':hourglass_flowing_sand: Quel bas de page voulez-vous attribuer à l\'embed?', fetchReply: true });
                    const response = await buttonInteraction.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                    const footerText = response.first()?.content;
                    if (footerText) {
                        embed.setFooter(footerText);
                        await question.delete();
                        await buttonInteraction.editReply({ embeds: [embed] });
                    }
                    break;
                }

                case 'colors': {
                    const question = await buttonInteraction.reply({ content: ':hourglass_flowing_sand: Quelle couleur voulez-vous attribuer à l\'embed?', fetchReply: true });
                    const response = await buttonInteraction.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                    const color = response.first()?.content;
                    if (color) {
                        embed.setColor(color);
                        await question.delete();
                        await buttonInteraction.editReply({ embeds: [embed] });
                    }
                    break;
                }

                case 'send': {
                    const question = await buttonInteraction.reply({ content: ':hourglass_flowing_sand: Dans quel salon voulez-vous envoyer l\'embed?', fetchReply: true });
                    const response = await buttonInteraction.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                    const channel = buttonInteraction.guild.channels.cache.get(response.first()?.content) || buttonInteraction.first().mentions.channels.first();
                    if (channel) {
                        channel.send({ embeds: [embed] });
                        await question.delete();
                        await buttonInteraction.editReply({ content: ':white_check_mark: L\'embed a été envoyé.' });
                    } else {
                        await buttonInteraction.followUp({ content: ':x: Salon invalide.', ephemeral: true });
                    }
                    break;
                }

                case 'cancel': {
                    await buttonInteraction.editReply({ content: ':white_check_mark: La création de l\'embed est annulée.', components: [] });
                    break;
                }
            }
        });

        collector.on('end', () => {
            interaction.editReply({ content: 'Temps écoulé. La création de l\'embed est annulée.', components: [] });
        });
    }
}