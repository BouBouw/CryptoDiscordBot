const { ApplicationCommandType, EmbedBuilder, Colors } = require('discord.js')
const { generateDailyQuests } = require('../../../handlers/functions/Economy/Quests')

module.exports = {
    name: 'quests',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    const quests = await generateDailyQuests(interaction.user.id, con);
    console.log(quests)

    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const timeLeftMs = endOfDay - now;

    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

    const timeLeftString = `${hours}h ${minutes}m ${seconds}s`;

    const embed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setDescription(`Temps restant pour compléter les quêtes : **${timeLeftString}**`)
    quests.forEach((quest, index) => {
        embed.addFields({
            name: `Quête ${index + 1} : ${quest.quest_type}`,
            value: `**Objectif** : ${quest.progress} / ${quest.objective}\n**Récompense** : ${quest.reward} XP`,
            inline: false
        });
    });

    return interaction.reply({ embeds: [embed] });

    }
}