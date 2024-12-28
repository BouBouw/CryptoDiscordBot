module.exports = {
	name: 'messageDelete',
	once: false,
execute: async (message, client, con) => {
    if(!message.guild) return;

    console.log(message)

    con.query(`SELECT * FROM snipe WHERE id = '1'`, function(err, result) {
        if(!result[0]) {
            con.query(`INSERT INTO snipe (userID, message) VALUES ('${message.author.id}', '${message.content}')`, function(err, result) {
                return;
            })
        } else {
            con.query(`UPDATE snipe SET userID = '${message.author.id}', message = '${message.content}'`, function(err, result) {
                return;
            })
        }
    })
    }
}