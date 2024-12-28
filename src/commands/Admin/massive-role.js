const { ApplicationCommandType, Colors, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'massive-role',
    description: '(📌) Administration',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "role",
            description: "Role",
            type: ApplicationCommandOptionType.Role,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.followUp({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` });

    const role = interaction.options.getRole('role');

    const members = await message.guild.members.fetch();
    for await (const [,member] of members) {
        await member.roles.add(role.id);
        await sleep(1000); // attendre 1 seconde
    }

    return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: `${role} vient d'être ajouter à tous les membres.`
        }]
    })
    }
}