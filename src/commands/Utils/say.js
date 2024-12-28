const { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js')

module.exports = {
    name: 'say',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "text",
            description: "Text to Say",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.followUp({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    const text = interaction.options.getString('text');

    await interaction.deferReply();
    await interaction.channel.send({ content: text });
    return interaction.deleteReply();

    }
}