const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { ApplicationCommandType, Colors, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js')

module.exports = {
    name: 'warn',
    description: '(⚙️) Moderation',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "User of sanction",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "type",
            description: "Type",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Add',
                    value: 'add'
                },
                {
                    name: 'Remove',
                    value: 'remove'
                },
            ]
        },
        {
            name: "reason",
            description: "Reason",
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
execute: async (client, interaction, args, con) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: `\`[❗]\` ${interaction.member}, vous n'avez pas la permission d'utiliser cette commande.` })
    
    const target = interaction.options.getMember('user');
    const type = interaction.options.getString('type');
    const reason = interaction.options.getString("reason") || "Aucune raison fournie.";

    if(!target.user.moderatable) return interaction.reply({ content: `Impossible d'avertir cet utilisateur.` }); 

    switch(type) {
        case 'add': {
            con.query(`INSERT INTO sanctions (userID, reason) VALUES ('${target.id}', '${reason}')`, function(err, result) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `${target} vient d'être avertis.`
                    }]
                })
            })
            break;
        }

        case 'remove': {
            con.query(`SELECT * FROM sanctions WHERE userID = '${target.id}' AND unbanAt IS NULL`, function(err, result) {
                if(!result[0]) return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `${target} n'a aucun avertissement.`
                    }]
                });

                const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .addOptions(
                        result.map((item, index) => (
                            new StringSelectMenuOptionBuilder()
                            .setValue(index)
                            .setLabel(`${index + 1}. ${item.reason}`)
                        ))
                    )
                )

                interaction.reply({
                    content: `Warns`,
                    components: [ row ]
                }).then(async (msg) => {
                    
                })
            })
            break;
        }
    }

    }
}