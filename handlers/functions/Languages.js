const getLanguage = async (con) => {
    return new Promise((resolve, reject) => {
        try {
            con.query(`SELECT * FROM settings WHERE id = '1'`, function(err, result) {
                return resolve(result[0].language);
            })
        } catch(error) {
            return reject(error);
        }
    })
}

const getLangCommands = async (name, con) => {
    const lang = await getLanguage(con);
    return new Promise((resolve, reject) => {
        try {
            const file = require(`../translations/${lang}.json`);

            const commands = file?.commands?.['sub-commands'];
            if (!commands || !commands[name]) {
                return reject(new Error(`Sub-command "${name}" not found in language file.`));
            }

            return resolve(commands[name]);
        } catch(error) {
            return reject(error);
        }
    })
}

const Languages = {
    getLanguage,
    getLangCommands
}

module.exports = Languages;