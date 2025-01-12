const { connection } = require('../../../index');
const Teams = require('./Teams');

const troopTypes = {
    "Soldat": 1,
    "Archer": 2,
    "Cavalier": 3,
    "Piquier": 4,
    "Éclaireur": 5,
    "Ingénieur": 6,
    "Médecin": 7,
    "Spécialisé": 8
};

const troopLimitsByLevel = [
    { min: 1, max: 3, limit: 1, allowedTypes: ["Soldat", "Archer"] },
    { min: 3, max: 7, limit: 2, allowedTypes: ["Soldat", "Archer", "Cavalier", "Piquier"] },
    { min: 7, max: 10, limit: 2, allowedTypes: ["Soldat", "Archer", "Cavalier", "Piquier", "Éclaireur", "Ingénieur", "Médecin"] },
    { min: 10, max: 20, limit: 3, allowedTypes: ["Soldat", "Archer", "Cavalier", "Piquier", "Éclaireur", "Ingénieur", "Médecin", "Spécialisé"] }
];

const MATCHMAKING_LEVEL_DIFFERENCE = 2;
const MATCHMAKING_TROOP_DIFFERENCE = 2;

const getTroopType = (troopName) => {
    return troopTypes[troopName] || 0;
};

const getLevelConfig = (level) => {
    return troopLimitsByLevel.find((config) => level >= config.min && level <= config.max);
};

// create battle

// battle function

const CreateTroops = async (userId, unit, message) => {
    const u = await Teams.CheckTeam(userId);
    const t = await Teams.GetTeamByName(u.data[0].name);

    const levelConfig = getLevelConfig(t.data[0].level);

    if (!levelConfig) {
        throw new Error(`Aucune configuration trouvée pour le niveau ${teamLevel}`);
    }

    if (!levelConfig.allowedTypes.includes(unit)) {
        return message.reply({
            content: `Unité "${unit}" non disponible au niveau ${teamLevel}`
        });
    }

    const troopLimitReached = await CheckLimitTroops(t.data[0].name, levelConfig.limit);
    if (troopLimitReached) {
        return message.reply({
            content: `Vous avez atteint la limite de troupes.`
        });
    }

    
    connection.query(
        `SELECT * FROM team_army_${t.data[0].name}`,
        function (err, result) {
            if (err && err.code === 'ER_NO_SUCH_TABLE') {
                connection.query(
                    `CREATE TABLE team_army_${t.data[0].name} (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        troopInt INT NOT NULL,
                        troopCount INT DEFAULT 0,
                        troopLevel INT DEFAULT 1
                    )`,
                    function (createErr) {
                        if (createErr) throw createErr;
                        console.log(`Table team_army_${t.data[0].name} créée.`);
                        insertTroop(t.data[0].name, unit);
                    }
                );
            } else {
                insertTroop(t.data[0].name, unit);
            }
        }
    );
};

const insertTroop = (teamName, unit) => {
    const troopType = getTroopType(unit);

    connection.query(
        `INSERT INTO team_army_${teamName} (troopInt, troopCount)
         VALUES (?, 1)
         ON DUPLICATE KEY UPDATE troopCount = troopCount + 1`,
        [troopType],
        function (err, result) {
            if (err) {
                console.error(`Erreur lors de l'ajout de la troupe : ${err.message}`);
            } else {
                console.log(`Troupe "${unit}" ajoutée avec succès.`);
            }
        }
    );
};

const CheckLimitTroops = async (teamName, limit) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT COUNT(*) AS troopCount FROM team_army_${teamName}`,
            function (err, result) {
                if (err) {
                    console.error(`Erreur lors de la vérification des limites : ${err.message}`);
                    return reject(err);
                }

                const currentTroopCount = result[0]?.troopCount || 0;
                resolve(currentTroopCount >= limit);
            }
        );
    });
};

const FindOpponent = async (teamName) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT * FROM teams WHERE name = ?`,
            [teamName],
            async function (err, teamResult) {
                if (err || !teamResult.length) {
                    return reject(new Error(`Équipe "${teamName}" introuvable.`));
                }

                const teamLevel = teamResult[0].level;
                const teamTroopCount = await getTotalTroops(teamName);

                connection.query(
                    `SELECT * FROM teams WHERE ABS(level - ?) <= ? AND name != ?`,
                    [teamLevel, MATCHMAKING_LEVEL_DIFFERENCE, teamName],
                    async function (err, opponents) {
                        if (err) {
                            console.error(`Erreur lors de la recherche d'adversaires : ${err.message}`);
                            return reject(err);
                        }

                        if (!opponents.length) {
                            return reject(new Error("Aucun adversaire trouvé dans une plage de niveaux acceptable."));
                        }

                        const validOpponents = [];
                        for (const opponent of opponents) {
                            const opponentTroopCount = await getTotalTroops(opponent.name);
                            if (Math.abs(teamTroopCount - opponentTroopCount) <= MATCHMAKING_TROOP_DIFFERENCE) {
                                validOpponents.push({
                                    ...opponent,
                                    troopCount: opponentTroopCount
                                });
                            }
                        }

                        if (!validOpponents.length) {
                            return reject(new Error("Aucun adversaire trouvé avec un nombre de troupes comparable."));
                        }

                        const chosenOpponent = validOpponents[Math.floor(Math.random() * validOpponents.length)];
                        resolve(chosenOpponent);
                    }
                );
            }
        );
    });
};

const getTotalTroops = (teamName) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT SUM(troopCount) AS totalTroops FROM team_army_${teamName}`,
            function (err, result) {
                if (err) {
                    console.error(`Erreur lors de la récupération des troupes de l'équipe "${teamName}": ${err.message}`);
                    return reject(err);
                }

                const totalTroops = result[0]?.totalTroops || 0;
                resolve(totalTroops);
            }
        );
    });
};

const Troops = {
    CreateTroops,
    CheckLimitTroops,
    getTotalTroops
}

const War = {
    FindOpponent
}

module.exports = { Troops, War };