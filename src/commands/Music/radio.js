const { ApplicationCommandType, Colors, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, VoiceConnectionStatus, entersState, NoSubscriberBehavior } = require('@discordjs/voice');

module.exports = {
    name: 'radio',
    description: '(💡) Music',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    const channel = interaction.member.voice;
    console.log(channel)
    if(!channel) return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: `Vous n'êtes pas dans un salon vocal.`
        }]
    });

    interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: ``,
            fields: [
                {
                    name: `Skyrock`,
                    value: `\u200b`
                },
                {
                    name: `NRJ`,
                    value: `\u200b`
                },
                {
                    name: `Mouv'`,
                    value: `\u200b`
                },
            ]
        }],
        components: [
            new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('radio_selector')
                .setPlaceholder("Choisissez une radio")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setValue('skyrock')
                    .setLabel("Skyrock")
                    .setDescription("Permet de lancer la radio : Skyrock"),
                    new StringSelectMenuOptionBuilder()
                    .setValue('nrj')
                    .setLabel("NRJ")
                    .setDescription("Permet de lancer la radio : NRJ"),
                    new StringSelectMenuOptionBuilder()
                    .setValue('mouv')
                    .setLabel("Mouv'")
                    .setDescription("Permet de lancer la radio : Mouv'"),
                )
            )
        ]
    }).then(async (msg) => {
        const filter = (i) => i.user.id === interaction.member.id && i.isStringSelectMenu();
        await Selects();

        async function Selects() {
            let select;

            try {
                select = await msg.awaitMessageComponent({ filter: filter });
            } catch(error) {
                if (error.code === "INTERACTION_COLLECTOR_ERROR") {
                    return msg.delete()
                }
            }

            if (!select.deffered) await select.deferUpdate();

            switch(select.values[0]) {
                case 'skyrock': {
                    try {
                        const connection = joinVoiceChannel({
                            channelId: channel.id,
                            guildId: channel.guild.id,
                            adapterCreator: channel.guild.voiceAdapterCreator,
                        });
                    
                        const player = createAudioPlayer({
                            behaviors: {
                                noSubscriber: NoSubscriberBehavior.Play,
                            },
                        });
                    
                        const resource = createAudioResource('http://icecast.skyrock.net/s/natio_mp3_128k', {
                            inputType: StreamType.Arbitrary,
                        });
                    
                        player.play(resource);
                        await entersState(connection, VoiceConnectionStatus.Ready, 5000);
                    
                        connection.subscribe(player);
                        return interaction.channel.send({
                            embeds: [{
                                color: Colors.Blue,
                                description: `Lecture en cours de : **Skyrock**.`
                            }]
                        });
                    } catch(error) {
                        console.log(error);
                        return interaction.channel.send({
                            embeds: [{
                                color: Colors.Red,
                                description: `Une erreur est survenue.`
                            }]
                        })
                    }

                    break;
                }
            }
        }
    })
    }
}