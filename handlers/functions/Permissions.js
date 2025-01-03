const { client } = require("../..");

const checkPermissionsRole = (userId) => {

};

const checkPermissionsInt = (userId) => {

};

async function scanRoles() {
    const guild = await client.guilds.cache.get('1209874388074364998');
    const roles = await guild.roles.cache;
    const members = await guild.members.fetch();
    console.log(members)

    const customRole = ['x'];
    const roleIds = [];

    roles.map((role, index) => {
        if((role.name).startsWith('p') || customRole.includes(role.name)) {
            roleIds.push(role.id)
            const total = role.members.map(m => m.id);
            console.log(total)
        }
    });
}

const Permissions = {
    checkPermissionsRole,
    checkPermissionsInt
};

module.exports = Permissions;