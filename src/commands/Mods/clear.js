const { ApplicationCommandType, Colors, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js')

module.exports = {
    name: 'clear',
    description: '(⚙️) Moderation',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "amount",
            description: "Amount of messages",
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.followUp({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })

    const count = interaction.options.getNumber('amount');
    if(!count || isNaN(count)) return interaction.reply({ content: `Votre nombre n'est pas valide.` });

    if(count > 99) {
        let countLoop = Math.round(count / 99)
        for(let loop = 0; loop < countLoop; loop++) {
           interaction.channel.bulkDelete(Math.floor(99 + 1), true)
            .catch((err) => { return; })
        }

        await interaction.reply({
            embeds: [{
                color: Colors.Blue,
                description: `${count} messages supprimés`
            }]
        })
    } else {
        interaction.channel.bulkDelete(Math.floor(count + 1), true).then(() => {
            if (count == 1) {var s = ""} else {var s = "s"}
            interaction.reply({
                embeds: [{
                    color: Colors.Blue,
                    description: `${count} message${s} supprimé${s}`
                }]
            })
         })
         .catch((err) => { return; })
    }
    
    }
}