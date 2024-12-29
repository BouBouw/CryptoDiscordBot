const questTypes = [
    { type: 'Envoyer des messages', objectiveRange: [10, 50], rewardRange: [50, 150] },
    { type: 'Temps en vocal', objectiveRange: [10, 60], rewardRange: [100, 300], unit: 'minutes' },
    { type: 'Ajouter des réactions', objectiveRange: [5, 20], rewardRange: [30, 100] },
    { type: 'Jouer à des parties', objectiveRange: [1, 5], rewardRange: [100, 250] },
    { type: 'Inviter des membres', objectiveRange: [1, 3], rewardRange: [200, 500] }
];

function generateQuests() {
    const randomQuests = [];
    for (let i = 0; i < 3; i++) {
        const quest = questTypes[Math.floor(Math.random() * questTypes.length)];
        const objective = Math.floor(Math.random() * (quest.objectiveRange[1] - quest.objectiveRange[0] + 1)) + quest.objectiveRange[0];
        const reward = Math.floor(Math.random() * (quest.rewardRange[1] - quest.rewardRange[0] + 1)) + quest.rewardRange[0];
        randomQuests.push({ type: quest.type, objective, reward, unit: quest.unit || '' });
    }
    return randomQuests;
}

async function generateDailyQuests(userId, con) {
    return new Promise((resolve, reject) => {
        try {
            con.query(`SELECT * FROM daily_quests WHERE userID = '${userId}' AND reset_date = CURDATE()`, function(err, result) {
                if(result.length > 0) return resolve(result);
        
                con.query(`DELETE FROM daily_quests WHERE userID = '${userId}'`);
                const quests = generateQuests();
                const resetDate = new Date().toISOString().split('T')[0];
        
                for(const quest of quests) {
                    con.query(`INSERT INTO daily_quests (userID, quest_type, objective, progress, reward, reset_date) VALUES (?, ?, ?, ?, ?, ?)`, [userId, quest.type, quest.objective, 0, quest.reward, resetDate])
                }
            })
        } catch(error) {
            reject(error)
        }
    })
}

const Quests = {
    generateQuests,
    generateDailyQuests
}

module.exports = Quests;