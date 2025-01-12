const { ChannelType } = require("discord.js");


module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    execute: async (oldState, newState, client, con) => {
        const INTERVAL_TIME = 20 * 60 * 1000;

        async function checkAndUpdateUsersInVoice() {
            try {
                const guild = newState.guild || oldState.guild;
                if (!guild) return;

                const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice);

                for (const [channelId, channel] of voiceChannels) {
                    for (const [memberId, member] of channel.members) {
                        if (!member.user.bot) {
                            await updateCoinsForMember(member, con);
                        }
                    }
                }
            } catch (err) {
                console.error('Erreur lors de la vérification des utilisateurs en vocal :', err);
            }
        }

        async function updateCoinsForMember(member, con) {
            const userId = member.id;

            con.query(`SELECT * FROM profile WHERE userID = ?`, [userId], function (err, result) {
                if (err) {
                    console.error(`Erreur lors de la récupération du profil pour l'utilisateur ${userId} :`, err);
                    return;
                }

                if (result.length === 0) {
                    console.log(`Profil non trouvé pour l'utilisateur ${userId}`);
                    return;
                }

                const currentCoins = result[0].coins;
                const coinsToAdd = calculateCoins(member);

                con.query(
                    `UPDATE profile SET coins = ? WHERE userID = ?`,
                    [currentCoins + coinsToAdd, userId],
                    function (err) {
                        if (err) {
                            console.error(`Erreur lors de la mise à jour des coins pour l'utilisateur ${userId} :`, err);
                        } else {
                            console.log(`Ajouté ${coinsToAdd} coins pour ${member.user.tag}.`);
                        }
                    }
                );
            });
        }

        function calculateCoins(member) {
            let coins = 6000;
            const voiceState = member.voice;

            if (voiceState.selfVideo) {
                coins += 4000;
            }

            if (voiceState.streaming) {
                coins += 5000;
            }

            if (voiceState.selfMute && voiceState.selfDeaf) {
                coins -= 2000;
            }

            return coins > 0 ? coins : 0;
        }

        if (!oldState.channel && newState.channel) {
            console.log(`${newState.member.user.tag} a rejoint un canal vocal.`);
        }

        if (oldState.channel && !newState.channel) {
            console.log(`${oldState.member.user.tag} a quitté un canal vocal.`);
        }

        if (client.voiceInterval) {
            clearInterval(client.voiceInterval);
        }

        client.voiceInterval = setInterval(checkAndUpdateUsersInVoice, INTERVAL_TIME);

        const allMembersInVoice = newState.guild.channels.cache.some(channel =>
            channel.type === 2 && channel.members.some(member => !member.user.bot)
        );

        if (!allMembersInVoice) {
            clearInterval(client.voiceInterval);
            console.log('Aucun utilisateur en vocal. Intervalle arrêté.');
        }
    },
};
