const { ApplicationCommandType, ApplicationCommandOptionType, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Teams = require('../../../handlers/functions/Teams/Teams');

module.exports = {
    name: 'team',
    description: '(👥) Teams',
    type: ApplicationCommandType.ChatInput,
    options: [
            {
                name: "type",
                description: "Type",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: 'Create',
                        value: 'create'
                    },
                    {
                        name: 'Delete',
                        value: 'delete'
                    },
                    {
                        name: 'Leave',
                        value: 'leave'
                    },
                    {
                        name: 'Invite',
                        value: 'invite',
                        description: `Require user`
                    },
                ]
            },
            {
                name: "user",
                description: "User of team",
                type: ApplicationCommandOptionType.User,
                required: false,
            },
        ],
execute: async (client, interaction, args, con) => {
    const t = await Teams.CheckTeam(interaction.user.id);
    const p = await Teams.GetCurrentTeam(interaction.user.id);

    const target = interaction.options.getMember('user');
    const type = interaction.options.getString('type');

    switch(type) {
        case 'create': {
            if(t.data[0]) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous possédé déjà ou vous êtes déjà dans une équipe.`
                    }]
                })
            }

            const modal = new ModalBuilder()
            .setCustomId('team.create')
            .setTitle("Création d'équipe")
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('name_input')
                        .setLabel("Quel est le nom de l'équipe ?")
                        .setMaxLength(8)
                        .setStyle(TextInputStyle.Short)
                )
            );
            await interaction.showModal(modal);
            
            const filter = (interaction) =>
                interaction.customId === 'team.create' &&
                interaction.user.id === interaction.member.id;
            try {
                const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 60000 });
                const name = modalInteraction.fields.getTextInputValue('name_input');
                const isValid = /^[a-zA-Z0-9_]+$/.test(name);

                if(isValid) {
                    await modalInteraction.reply({
                        embeds: [{
                            color: Colors.Blue,
                            description: `Votre équipe \`${name}\` vient d'être crée.`,
                        }],
                        components: [
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId('team.avatar')
                                .setLabel("Ajouter une icône d'équipe")
                                .setStyle(ButtonStyle.Secondary)
                            )
                        ]
                    }).then(async () => {
                        return Teams.Create(interaction.user.id, name);
                    })
                } else {
                    await modalInteraction.reply({
                        embeds: [{
                            color: Colors.Blue,
                            description: `Votre nom d'équipe ne doit pas contenir de caractères spéciaux ou d'espaces.`
                        }]
                    })
                }
            } catch(error) {
                throw error;
            }
            break;
        }

        case 'delete': {
            if(p.data[0].permissionInt !== 3) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous ne possédez pas d'équipe.`
                    }]
                })
            }

            interaction.reply({
                embeds: [{
                    color: Colors.Blue,
                    description: `Votre équipe \`${t.data[0].name}\` vient d'être supprimée.`
                }]
            }).then(async () => {
                return await Teams.Delete(interaction.user.id)
            })

            break;
        }

        case 'leave': {
            if(!t.data[0]) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous n'êtes pas dans une équipe.`
                    }]
                })
            }
            break;
        }

        case 'invite': {
            const s = await Teams.MembersTeamLength(t.data[0].name);
        
            if(!target) return interaction.reply({
                embeds: [{
                    color: Colors.Blue,
                    description: `Vous devez mentionner un utilisateur.`
                }]
            });

            if(p.data[0].permissionInt !== 3) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous ne possédez pas d'équipe.`
                    }]
                })
            };

            if(s.data.size >= 20) {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Vous avez déjà le maximum de membres dans votre équipe.`
                    }]
                })
            }

            // generate token invite
            // send invite in MP & send 24h link joinable

            break;
        }
    }
    }
}