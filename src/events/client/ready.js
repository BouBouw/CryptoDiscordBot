const { ActivityType } = require('discord.js');
const Interest = require('../../../handlers/functions/Economy/Interest');

const presenceMapping = {
    0: "offline",
    1: "online",
    2: "idle",
    3: "dnd"
}

module.exports = {
	name: 'ready',
	once: false,
execute: async (client, connection) => {    
    console.log('[API] '.bold.green + `Connected to Discord.`.bold.white)

    connection.query(`SELECT * FROM settings WHERE id = '1'`, function(err, result) {
        client.user.setPresence({
            activities: [
                {
                    name: `${result[0].presence_text || "Discord Bot Template"}`,
                    type: ActivityType.Watching
                }
            ],
            status: presenceMapping[result[0].presence_type]
        });  
    })

    await Interest();

    }
}