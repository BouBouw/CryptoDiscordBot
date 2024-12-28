const { ApplicationCommandType, Colors, ApplicationCommandOptionType } = require('discord.js');
const weather = require('weather-js');

module.exports = {
    name: 'weather',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "city",
            description: "City",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
execute: async (client, interaction, args, con) => {
    const city = interaction.options.getString('city');

    weather.find({search: args.join(" "), degreeType: 'C'}, function(err, result) {
        try {
            let skyText = ''
            if(result[0].current.skytext == 'Cloudy') {
                skyText = '🌥️ Nuageux'
            } else if(result[0].current.skytext == 'Rain') {
                skyText = '🌧️ Pluvieux'
            } else if(result[0].current.skytext == 'Partly Cloudy') {
                skyText = '☁️ Partiellement nuageux'
            } else if(result[0].current.skytext == 'Sunny') {
                skyText = '☀️ Ensolleilé'
            } else {
                skyText = '☀️ Ensolleilé'
            }

            return interaction.reply({
                embeds: [{
                    color: Colors.Blue,
                    title: `Météo de ${result[0].location.name}`,
                    thumbnail: {
                        url: `${result[0].current.imageUrl}`,
                    },
                    fields: [
                        {
                            name: `Température`,
                            value: `${result[0].current.temperature} °C`,
                        },
                        {
                            name: `Ciel`,
                            value: `${skyText}`,
                        },
                        {
                            name: `Vitesse de vent`,
                            value: `${result[0].current.windspeed}`,
                            inline: true 
                        },
                        {
                            name: `Humidité`,
                            value: `${result[0].current.humidity}%`,
                            inline: true
                        }
                    ],
                }]
            })
        } catch(err) {
            return message.channel.send({ content: `:hourglass_flowing_sand: - ${message.author} une erreur est survenue, nous ne parvenons pas a trouver la météo de la ville souhaiter.`})
        }
        })
    }
}