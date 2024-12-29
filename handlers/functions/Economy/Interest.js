const cron = require('node-cron');

const { connection } = require('../../../index');

async function applyMonthlyInterest() {
    const today = new Date();

    const [users] = await connection.query('SELECT userID, inBank, last_interest_timestamp FROM profile');
    for (const user of users) {
        const lastApplied = new Date(user.last_claim_timestamp);
        const monthsElapsed = today.getMonth() - lastApplied.getMonth() + (12 * (today.getFullYear() - lastApplied.getFullYear()));

        if (monthsElapsed > 0 && user.inBank > 0) {
            const newBalance = Math.floor(user.inBank * Math.pow(1 + INTEREST_RATE, monthsElapsed) * 100) / 100;
            await connection.query('UPDATE profile SET inBank = ?, last_interest_timestamp = ? WHERE userID = ?', [newBalance, today, user.userID]);
        }
    }
    console.log('Intérêts mensuels appliqués.');
}


function Interest() {
    cron.schedule('0 0 1 * *', async () => {
        await applyMonthlyInterest();
    });
};

module.exports = Interest;