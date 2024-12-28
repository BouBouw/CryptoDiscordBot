const { ApplicationCommandType, Colors, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "User",
            type: ApplicationCommandOptionType.User,
            required: false,
        }
    ],
execute: async (client, interaction, args, con) => {
    const target = interaction.options.getUser('user');

    const avatar = target?.displayAvatarURL() || interaction.user.displayAvatarURL();

    return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: `[Lien de l'avatar](${avatar})`,
            image: {
                url: avatar
            }
        }],
        components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel("Ouvrir sur le Web.")
                .setURL(avatar)
                .setStyle(ButtonStyle.Link)
            )
        ]
    })
    }
}