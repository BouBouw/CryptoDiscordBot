const getUser = async (userId, con) => {
    return new Promise((resolve, reject) => {
        try {
            con.query(`SELECT * FROM profile WHERE userID = '${userId}'`, function(err, result) {
                if(!result[0]) {
                    con.query(`INSERT INTO profile (userID) VALUES ('${userId}')`, function(err, result) {
                        return resolve({
                            id: result.insertId,
                            userID: userId,
                            experiences: 0,
                            level: 0,
                            last_interest_timestamp: new Date(),
                            last_claim_timestamp: new Date(),
                            coins: 0.00,
                            inBank: 0.00,
                            crypto: 0.00,
                            gameTotal: 0,
                            gameLoose: 0,
                            gameWin: 0
                        })
                    })
                } else {
                    return resolve(result[0]);
                }
            })
        } catch(error) {
            reject(error);
        }
    })
}

const Users = {
    getUser
}

module.exports = Users;