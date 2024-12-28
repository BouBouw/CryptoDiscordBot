const { ApplicationCommandType, Colors } = require('discord.js')

module.exports = {
    name: 'snipe',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    async function getSnipe() {
        return new Promise((resolve, reject) => {
            try {
                con.query(`SELECT * FROM snipe WHERE id = '1'`, function(err, result) {
                    if(!result[0]) {
                        return resolve(null)
                    } else {
                        return resolve(result[0]);
                    }
                })
            } catch(error) {
                reject(error);
            }
        })
    }

    async function getUser(userId) {
        return new Promise((resolve, reject) => {
            try {
                return resolve(interaction.guild.members.fetch(userId))
            } catch(error) {
                reject(error);
            }
        })
    }

    const snipe = await getSnipe();
    if(snipe === null) return interaction.reply({ content: `Aucun message a snipe.`, ephemeral: true });

    const target = await getUser(snipe.userID);
    return interaction.reply({
        embeds: [{
            color: Colors.Blue,
            author: {
                name: target.user.username,
		        icon_url: target.user.displayAvatarURL(),
            },
            description: `${snipe.message}`,
            timestamp: new Date(snipe.createdAt).toISOString()
        }]
    })
    
    }
}