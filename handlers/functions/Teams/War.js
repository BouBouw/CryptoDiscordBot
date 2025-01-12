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

const troopStats = {
    "Soldat": { damage: 10, attackSpeed: 1, health: 100 },
    "Archer": { damage: 15, attackSpeed: 2, health: 70 },
    "Cavalier": { damage: 20, attackSpeed: 1.5, health: 150 },
    "Piquier": { damage: 12, attackSpeed: 1.2, health: 120 },
    "Éclaireur": { damage: 8, attackSpeed: 3, health: 50 },
    "Ingénieur": { damage: 5, attackSpeed: 1, health: 80 },
    "Médecin": { damage: 0, attackSpeed: 1, health: 60 }, // Médecin peut éventuellement soigner
    "Spécialisé": { damage: 25, attackSpeed: 0.8, health: 200 }
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

let battleHistory = [];

// create battle

const StartBattle = async (team1Name, team2Name, threadChannel) => {
    try {
        const team1Stats = await getTeamArmy(team1Name);
        const team2Stats = await getTeamArmy(team2Name);

        if (!team1Stats.length || !team2Stats.length) {
            throw new Error("Une des équipes n'a pas de troupes disponibles pour combattre.");
        }

        console.log(`Début du combat : ${team1Name} VS ${team2Name}`);
        battleHistory = []; // Réinitialiser l'historique des actions

        // Commencer la bataille sur 30 secondes
        let winner = await runBattle(team1Stats, team2Stats, threadChannel);

        // Enregistrer le résultat du combat
        if (winner === "team1") {
            threadChannel.send(`${team1Name} a gagné la bataille !`);
        } else {
            threadChannel.send(`${team2Name} a gagné la bataille !`);
        }

        // Afficher l'historique des actions dans le thread
        threadChannel.send("Historique des actions de la bataille :");
        threadChannel.send(battleHistory.join("\n"));

    } catch (err) {
        console.error(`Erreur lors de la bataille : ${err.message}`);
    }
};

// Simulation de combat avec 30 secondes réparties
const runBattle = async (team1, team2, threadChannel) => {
    let team1TotalHealth = calculateTotalHealth(team1);
    let team2TotalHealth = calculateTotalHealth(team2);

    const totalDuration = 30000; // 30 secondes
    const actionsPerSecond = 1; // Une action par seconde
    const totalActions = totalDuration / 1000 * actionsPerSecond;

    let turn = 1;
    const startTime = Date.now();

    while (team1TotalHealth > 0 && team2TotalHealth > 0 && Date.now() - startTime < totalDuration) {
        // Calcul des dégâts à chaque action
        const team1Damage = calculateTotalDamage(team1);
        const team2Damage = calculateTotalDamage(team2);

        // Appliquer les dégâts
        team2TotalHealth -= team1Damage;
        team1TotalHealth -= team2Damage;

        // Ajouter les actions au RP
        await addToBattleHistory(team1, team2, team1Damage, team2Damage, threadChannel);

        // Attendre avant de faire une nouvelle action (répartie sur 30 secondes)
        const elapsedTime = Date.now() - startTime;
        const timeRemaining = totalDuration - elapsedTime;
        const delay = Math.max(0, timeRemaining / totalActions);

        // Attendre avant de passer à l'action suivante
        await new Promise(resolve => setTimeout(resolve, delay));

        turn++;
    }

    return team1TotalHealth > 0 ? "team1" : "team2";
};

// Fonction pour ajouter les actions au RP dans le thread
const addToBattleHistory = async (team1, team2, team1Damage, team2Damage, threadChannel) => {
    const team1Actions = team1.map(troop => `${troop.type} inflige ${troop.stats.damage * troop.stats.attackSpeed * troop.count} dégâts.`);
    const team2Actions = team2.map(troop => `${troop.type} inflige ${troop.stats.damage * troop.stats.attackSpeed * troop.count} dégâts.`);
    
    // Enregistrer les actions dans le thread
    battleHistory.push(`--- Tour ---`);
    battleHistory.push(`Équipe 1 inflige ${team1Damage} dégâts. Équipe 2 : ${team2.reduce((total, troop) => total + troop.stats.health * troop.count, 0)} PV restants.`);
    battleHistory.push(`Équipe 2 inflige ${team2Damage} dégâts. Équipe 1 : ${team1.reduce((total, troop) => total + troop.stats.health * troop.count, 0)} PV restants.`);
    
    // Ajouter au thread Discord
    await threadChannel.send(`Équipe 1 inflige ${team1Damage} dégâts. Équipe 2 : ${team2.reduce((total, troop) => total + troop.stats.health * troop.count, 0)} PV restants.`);
    await threadChannel.send(`Équipe 2 inflige ${team2Damage} dégâts. Équipe 1 : ${team1.reduce((total, troop) => total + troop.stats.health * troop.count, 0)} PV restants.`);
    
    team1.forEach(troop => battleHistory.push(`${troop.type} a ${troop.stats.health * troop.count} PV restants.`));
    team2.forEach(troop => battleHistory.push(`${troop.type} a ${troop.stats.health * troop.count} PV restants.`));

    // Envoyer les informations dans le thread Discord
    team1.forEach(troop => threadChannel.send(`${troop.type} a ${troop.stats.health * troop.count} PV restants.`));
    team2.forEach(troop => threadChannel.send(`${troop.type} a ${troop.stats.health * troop.count} PV restants.`));
};

// Calcul des dégâts totaux par équipe
const calculateTotalDamage = (team) => {
    return team.reduce((total, troop) => {
        const damage = troop.stats.damage * troop.stats.attackSpeed * troop.count;
        return total + damage;
    }, 0);
};

// Calcul des points de vie totaux par équipe
const calculateTotalHealth = (team) => {
    return team.reduce((total, troop) => {
        const health = troop.stats.health * troop.count;
        return total + health;
    }, 0);
};

// Fonction pour récupérer l'armée d'une équipe
const getTeamArmy = (teamName) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT troopInt, troopCount, troopLevel FROM team_army_${teamName}`,
            function (err, result) {
                if (err) {
                    console.error(`Erreur lors de la récupération de l'armée de l'équipe "${teamName}": ${err.message}`);
                    return reject(err);
                }

                const troops = result.map((row) => {
                    const troopType = Object.keys(troopTypes).find(key => troopTypes[key] === row.troopInt);
                    return {
                        type: troopType,
                        count: row.troopCount,
                        level: row.troopLevel,
                        stats: troopStats[troopType]
                    };
                });

                resolve(troops);
            }
        );
    });
};

// Fonction pour créer un salon thread dans Discord et démarrer la bataille
const createBattleThread = async (team1Name, team2Name, message) => {
    const threadChannel = await message.channel.threads.create({
        name: `Bataille: ${team1Name} VS ${team2Name}`,
        autoArchiveDuration: 60,
        reason: `Début de la bataille entre ${team1Name} et ${team2Name}`,
    });

    await StartBattle(team1Name, team2Name, threadChannel);
};

// battle function

const CreateTroops = async (userId, unit, message) => {
    const u = await Teams.CheckTeam(userId);
    const t = await Teams.GetTeamByName(u.data[0].name);

    const levelConfig = getLevelConfig(t.data[0].level);

    if (!levelConfig) {
        throw new Error(`Aucune configuration trouvée pour le niveau ${t.data[0].level}`);
    }

    if (!levelConfig.allowedTypes.includes(unit)) {
        return message.reply({
            content: `Unité "${unit}" non disponible au niveau ${t.data[0].level}`
        });
    }

    const troopLimitReached = await CheckLimitTroops(t.data[0].name, levelConfig.limit);
    if (troopLimitReached) {
        return message.reply({
            content: `Vous avez atteint la limite de troupes.`
        });
    }

    // Vérifier si la table existe, sinon la créer
    connection.query(
        `SHOW TABLES LIKE 'team_army_${t.data[0].name}'`,
        function (err, result) {
            if (err) {
                console.error(`Erreur lors de la vérification de la table: ${err.message}`);
                return message.reply({
                    content: `Erreur lors de la vérification de la table des troupes.`
                });
            }

            if (result.length === 0) {
                // La table n'existe pas, il faut la créer
                connection.query(
                    `CREATE TABLE team_army_${t.data[0].name} (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        troopInt INT NOT NULL,
                        troopCount INT DEFAULT 0,
                        troopLevel INT DEFAULT 1
                    )`,
                    function (createErr) {
                        if (createErr) {
                            console.error(`Erreur lors de la création de la table: ${createErr.message}`);
                            return message.reply({
                                content: `Erreur lors de la création de la table des troupes.`
                            });
                        }
                        console.log(`Table team_army_${t.data[0].name} créée.`);
                        insertTroop(t.data[0].name, unit, message);
                    }
                );
            } else {
                // La table existe déjà, ajouter la troupe
                insertTroop(t.data[0].name, unit, message);
            }
        }
    );
};

const insertTroop = (teamName, unit, message) => {
    const troopType = getTroopType(unit);

    connection.query(
        `INSERT INTO team_army_${teamName} (troopInt, troopCount)
         VALUES (?, 1)
         ON DUPLICATE KEY UPDATE troopCount = troopCount + 1`,
        [troopType],
        function (err, result) {
            if (err) {
                console.error(`Erreur lors de l'ajout de la troupe : ${err.message}`);
                return message.reply({
                    content: `Erreur lors de l'ajout de la troupe "${unit}".`
                });
            } else {
                console.log(`Troupe "${unit}" ajoutée avec succès.`);
                message.reply({
                    content: `Troupe "${unit}" ajoutée avec succès.`
                });
            }
        }
    );
};

const CheckLimitTroops = async (teamName, limit) => {
    return new Promise((resolve, reject) => {
        // Vérifier si la table des troupes existe
        connection.query(
            `SHOW TABLES LIKE 'team_army_${teamName}'`,
            function (err, result) {
                if (err) {
                    console.error(`Erreur lors de la vérification de la table : ${err.message}`);
                    return reject(err);
                }

                // Si la table n'existe pas, on renvoie que la limite n'est pas atteinte
                if (result.length === 0) {
                    console.log(`La table pour l'équipe "${teamName}" n'existe pas. Limite de troupes non atteinte.`);
                    return resolve(false); // Limite non atteinte puisque la table n'existe pas
                }

                // Si la table existe, vérifier le nombre de troupes
                connection.query(
                    `SELECT COUNT(*) AS troopCount FROM team_army_${teamName}`,
                    function (err, result) {
                        if (err) {
                            console.error(`Erreur lors de la récupération du nombre de troupes : ${err.message}`);
                            return reject(err);
                        }

                        const currentTroopCount = result[0]?.troopCount || 0;
                        resolve(currentTroopCount >= limit);
                    }
                );
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
    StartBattle,
    createBattleThread,
    FindOpponent
}

module.exports = { Troops, War };