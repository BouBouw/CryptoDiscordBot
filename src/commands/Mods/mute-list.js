const { ApplicationCommandType, Colors, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js')

module.exports = {
    name: 'mute-list',
    description: '(⚙️) Moderation',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.followUp({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    const membersWithTimeout = interaction.guild.members.cache.filter(
        member => member.communicationDisabledUntil && member.communicationDisabledUntil > new Date()
    );

    if(membersWithTimeout.size === 0) return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: `Aucun membre muet.`
        }]
    });

    const timeoutList = membersWithTimeout.map(
        member => `• **${member.user.tag}** - Jusqu'au ${new Date(member.communicationDisabledUntil).toLocaleString()}`
    ).join('\n');

    const ITEMS_PER_PAGE = 10; // Number of members per page
    const totalPages = Math.ceil(timeoutList.length / ITEMS_PER_PAGE);
    let currentPage = 0;

    // Create embed for the current page
    const generateEmbed = (page) => {
        const start = page * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;

        return new EmbedBuilder()
            .setColor(Colors.Blue)
            .setDescription(timeoutList.slice(start, end).join('\n'))
            .setFooter({ text: `Page ${page + 1}/${totalPages}` })
    };

    // Create navigation buttons
    const getButtons = (page) => {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('⬅️ Précédent')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('➡️ Suivant')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === totalPages - 1)
        );
    };

    // Initial reply
    const initialMessage = await interaction.reply({
        embeds: [generateEmbed(currentPage)],
        components: [getButtons(currentPage)],
        fetchReply: true,
    });

    // Collector for button interactions
    const collector = initialMessage.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 60000, // 1 minute
    });

    collector.on('collect', async (i) => {
        if (i.customId === 'prev') {
            currentPage = Math.max(currentPage - 1, 0);
        } else if (i.customId === 'next') {
            currentPage = Math.min(currentPage + 1, totalPages - 1);
        }

        // Update the embed and buttons
        await i.update({
            embeds: [generateEmbed(currentPage)],
            components: [getButtons(currentPage)],
        });
    });

    collector.on('end', () => {
        // Disable buttons when time runs out
        initialMessage.edit({
            components: [getButtons(currentPage).setComponents(
                ...getButtons(currentPage).components.map((btn) => btn.setDisabled(true))
            )],
        });
    });

    }
}