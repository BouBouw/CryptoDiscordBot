const { Colors } = require("chart.js");

const { getUser } = require("../../../handlers/functions/Users");

module.exports = {
	name: 'messageCreate',
	once: false,
execute: async (message, client, con) => {
    if (message.author.bot) return;

    async function updateUser(userId, experience, level) {
        con.query(`UPDATE profile SET experiences = ?, level = ? WHERE userID = ?`, [experience, level, userId])
    }

    function calculateRequiredExperience(level) {
        const baseExp = 500;
        return Math.round(baseExp * Math.pow(2.5, level - 1));
    }

    const user = await getUser(message.author.id, con);

    const expGain = Math.floor(Math.random() * 11) + 5;
    let newExp = user.experiences + expGain;
    let newLevel = user.level;

    while (newExp >= calculateRequiredExperience(newLevel)) {
        newExp -= calculateRequiredExperience(newLevel);
        newLevel++;
    }

    await updateUser(message.author.id, newExp, newLevel);

    if (newLevel > user.level) {
        message.channel.send({
            embeds: [{
                color: Colors.Blue,
                description: `${message.author} vient d'atteindre le niveau \`#${newLevel}\`.`
            }]
        });
    }

    }
}