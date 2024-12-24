const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require('discord.js');
const GetAllCommands = require('../../../handlers/functions/GetAllCommands');

module.exports = {
    name: 'help',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    let page = 0;

    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId('Help.FirstPage')
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setCustomId('Help.PreviousPage')
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
        .setCustomId('Help.Delete')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
        .setCustomId('Help.NextPage')
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
        .setCustomId('Help.LastPage')
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Secondary),
    )

    const row_1 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId("Help.Settings")
        .setLabel('Settings')
        .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
        .setLabel('Documentation')
        .setURL("http://localhost:90/documentation")
        .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
        .setLabel('Website')
        .setURL("http://localhost:90/home")
        .setStyle(ButtonStyle.Link),
    )

    interaction.reply({
        embeds: [{
            color: Colors.Orange,
            title: `Help Page :`,
            fields: [
                {
                    name: `\u200b`,
                    value: `Commands Count : \`${GetAllCommands.CommandSize(client)}\``
                }
            ],
            footer: {
                text: `Page : ${page}/${GetAllCommands.CategorySize(client)}`
            }
        }],
        components: [ row, row_1 ]
    }).then(async (msg) => {
        const filter = (i) => i.user.id === interaction.member.id;
        await Buttons();

        async function Buttons() {
            let collected;
            try {
                collected = await msg.awaitMessageComponent({ filter: filter });
            } catch(err) {
                if(err.code === 'INTERACTION_COLLECTOR_ERROR') {
                    return msg.delete();
                }
            }

            if(!collected.deffered) await collected.deferUpdate();

            switch(collected.customId) {
                case 'Help.Delete': {
                    await msg.delete();
                    break;
                }

                case 'Help.FirstPage': {
                    page = 1;

                    msg.edit({
                        embeds: [{
                            color: Colors.Orange,
                            title: `Help Page :`,
                            fields: [
                                {
                                    name: `${await GetAllCommands.GetCategoryByPage(client, page)}`,
                                    value: `${(await GetAllCommands.GetCommandByCategories(client, page)).join(', ')}`
                                }
                            ],
                            footer: {
                                text: `Page : ${page}/${GetAllCommands.CategorySize(client)}`
                            }
                        }],
                        components: [ row, row_1 ]
                    });

                    await Buttons();
                    break;
                }

                case 'Help.PreviousPage': {
                    page = page - 1;
                    if(page <= 0) page = 1;

                    msg.edit({
                        embeds: [{
                            color: Colors.Orange,
                            title: `Help Page :`,
                            fields: [
                                {
                                    name: `${await GetAllCommands.GetCategoryByPage(client, page)}`,
                                    value: `${(await GetAllCommands.GetCommandByCategories(client, page)).join(', ')}`
                                }
                            ],
                            footer: {
                                text: `Page : ${page}/${GetAllCommands.CategorySize(client)}`
                            }
                        }],
                        components: [ row, row_1 ]
                    });

                    await Buttons();
                    break;
                }

                case 'Help.Delete': {
                    collected.message.delete();
                    break;
                }

                case 'Help.NextPage': {
                    page = page + 1;
                    if(page >= Number(GetAllCommands.CategorySize(client))) page = Number(GetAllCommands.CategorySize(client));

                    msg.edit({
                        embeds: [{
                            color: Colors.Orange,
                            title: `Help Page :`,
                            fields: [
                                {
                                    name: `${await GetAllCommands.GetCategoryByPage(client, page)}`,
                                    value: `${(await GetAllCommands.GetCommandByCategories(client, page)).join(', ')}`
                                }
                            ],
                            footer: {
                                text: `Page : ${page}/${GetAllCommands.CategorySize(client)}`
                            }
                        }],
                        components: [ row, row_1 ]
                    });

                    await Buttons();
                    break;
                }

                case 'Help.LastPage': {
                    page = Number(GetAllCommands.CategorySize(client));

                    msg.edit({
                        embeds: [{
                            color: Colors.Orange,
                            title: `Help Page :`,
                            fields: [
                                {
                                    name: `${await GetAllCommands.GetCategoryByPage(client, page)}`,
                                    value: `${(await GetAllCommands.GetCommandByCategories(client, page)).join(', ')}`
                                }
                            ],
                            footer: {
                                text: `Page : ${page}/${GetAllCommands.CategorySize(client)}`
                            }
                        }],
                        components: [ row, row_1 ]
                    });

                    await Buttons();
                    break;
                }
            }
        }
    })
    }
}