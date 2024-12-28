const getUser = async (userId, con) => {
    return new Promise((resolve, reject) => {
        try {
            con.query(`SELECT * FROM profile WHERE userID = '${userId}'`, function(err, result) {
                if(!result[0]) {
                    // insert data
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