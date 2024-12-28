const { ApplicationCommandType, Colors } = require('discord.js');
const fetch = require("node-fetch");

module.exports = {
    name: 'ass',
    description: '(💡) Nsfw',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    if(!interaction.channel.nsfw) return interaction.reply({ content: `\`[❗]\` ${interaction.member}, ce n'est pas un salon NSFW.`})

    fetch(`https://nekobot.xyz/api/image?type=ass`)
        .then(res => res.json())
        .then(data => {
            return interaction.reply({
                embeds: [{
                    color: Colors.Red,
                    title: `:underage: Ass`,
                    description: `L'image ne s'affiche pas ? [Cliquez ici](${data.message})`,
                    image: {
                        url: `${data.message}`
                    }
                }],
            })
        })
    }
}