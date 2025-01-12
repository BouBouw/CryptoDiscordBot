const { connection } = require('../../../index');

const Create = (ownerId, name) => {
 connection.query(`INSERT INTO teams (userID, name) VALUES ('${ownerId}', '${name}')`, function(err, result) {
    connection.query(`CREATE TABLE team_${name} (id INT AUTO_INCREMENT PRIMARY KEY, userID VARCHAR(255), permissionInt INT, joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`, function(err, result) {
        connection.query(`INSERT INTO team_${name} (userID, permissionInt) VALUES ('${ownerId}', '3')`, function(err, result) {
            connection.query(`INSERT INTO teams_players (userID, name) VALUES ('${ownerId}', '${name}')`, function(err, result) {

            })
        })
    })
 });
};

const Delete = (ownerId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const t = await CheckTeam(ownerId);

            connection.query(`DELETE FROM teams WHERE userID = '${ownerId}'`, function(err, result) {
                connection.query(`DROP TABLE team_${t.data[0].name}`, function(err, result) {
                    connection.query(`DELETE FROM team_players WHERE name = '${t.data[0].name}'`, function(err, result) {
                        resolve(true)
                    })
                })
            })
        } catch(err) {
            reject(err)
        }
    })
};

const Edit = (ownerId) => {

};

const Leave = (userId) => {

}

const CheckTeam = (userId) => {
    return new Promise((resolve, reject) => {
        try {
            connection.query(`SELECT * FROM teams_players WHERE userID = '${userId}'`, function(err, result) {
                if(!result[0]) {
                    resolve({ data: [] });
                } else {
                    resolve({ data: [ result[0] ]})
                }
            })
        } catch(err) {
            reject(err)
        }
    })
};

const GetCurrentTeam = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const t = await CheckTeam(userId);

            connection.query(`SELECT * FROM team_${t.data[0].name} WHERE userID = '${userId}'`, function(err, result) {
                resolve({ data: [ result[0] ]})
            })
        } catch(err) {
            reject(err)
        }
    })
}

const GetTeamByName = (name) => {
    return new Promise(async (resolve, reject) => {
        try {
            connection.query(`SELECT * FROM teams WHERE name = '${name}'`, function(err, result) {
                resolve({ data: [ result[0] ]})
            })
        } catch(err) {
            reject(err)
        }
    })
}

const MembersTeamLength = (name) => {
    return new Promise(async (resolve, reject) => {
        try {
            connection.query(
                `SELECT permissionInt, COUNT(*) AS count FROM team_${name} GROUP BY permissionInt`, 
                function(err, results) {
                    if (err) {
                        return reject(err);
                    }
            
                    const permSize = {
                        members: 0,
                        officiers: 0,
                        sergents: 0,
                        creator: 0 
                    };
            
                    results.forEach(row => {
                        switch (row.permissionInt) {
                            case 0:
                                permSize.members = row.count;
                                break;
                            case 1:
                                permSize.officiers = row.count;
                                break;
                            case 2:
                                permSize.sergents = row.count;
                                break;
                            case 3:
                                permSize.creator = row.count;
                                break;
                        }
                    });
            
                    const totalSize = results.reduce((sum, row) => sum + row.count, 0);
            
                    resolve({
                        data: {
                            size: totalSize,
                            permSize: permSize
                        }
                    });
                }
            );
        } catch(err) {
            reject(err)
        }
    })
}

const Teams = {
    Create,
    Delete,
    CheckTeam,
    GetCurrentTeam,
    GetTeamByName,
    MembersTeamLength
}

module.exports = Teams;