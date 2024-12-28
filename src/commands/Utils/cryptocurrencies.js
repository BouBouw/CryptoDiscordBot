const { ApplicationCommandType, Colors, ApplicationCommandOptionType } = require('discord.js');
const weather = require('weather-js');
const fetch = require('node-fetch');

module.exports = {
    name: 'cryptocurrencies',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "name",
            description: "Cryptocurrencie name",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    const name = interaction.options.getString('name');

    const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${name}`
    );
    const data = await response.json();
    if(!data) return interaction.reply({ content: `Aucune informations trouvée pour \`${name}\``})

    return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            title: `${data.name} [${(data.symbol).toUpperCase()}]`,
            fields: [
                {
                    name: `Site`,
                    value: `${data.links ? data.links.homepage[0] : "Aucun site internet."}`
                },
                {
                    name: `Prix`,
                    value: `EUR ⇾ **${data.market_data.current_price.eur}** €\n USD ⇾ **${data.market_data.current_price.usd}** $`,
                    inline: true
                },
            ],
            thumbnail: {
                url: `${data.image.large}`,
            },
        }]
    })

    }
}