const { ApplicationCommandType, AttachmentBuilder } = require('discord.js')
const { createCanvas, loadImage } = require('canvas');

const { getUser } = require('../../../handlers/functions/Users')

module.exports = {
    name: 'rank',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
        const user = await getUser(interaction.user.id, con);

        const { experiences, level } = user;

        const baseExp = 500;
        let xpForNextLevel;

        if (level === 0) {
            xpForNextLevel = baseExp;
        } else {
            xpForNextLevel = Math.floor(baseExp * Math.pow(2.5, level - 1));
        }

        const progress = experiences / xpForNextLevel;

        const canvas = createCanvas(800, 300);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#23272A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 128 }));

        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 150, 64, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 86, 86, 128, 128);
        ctx.restore();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(interaction.user.username, 250, 120);

        ctx.fillStyle = '#7289DA';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(`Niveau: ${level}`, 250, 160);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        ctx.fillText(`XP: ${experiences} / ${xpForNextLevel}`, 250, 200);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(250, 220, 500, 30);

        ctx.fillStyle = '#34aeeb';
        ctx.fillRect(250, 220, 500 * progress, 30);

        ctx.strokeStyle = '#23272A';
        ctx.strokeRect(250, 220, 500, 30);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'rank.png' });
        return interaction.reply({ files: [attachment] });
    }
}