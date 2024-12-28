const { ApplicationCommandType } = require('discord.js');
const { createCanvas } = require('canvas');

module.exports = {
    name: 'chart',
    description: '(💡) Economy',
    type: ApplicationCommandType.ChatInput,
    execute: async (client, interaction, args, con) => {
        // Fonction pour récupérer les données des transactions
        async function getChartData() {
            return new Promise((resolve, reject) => {
                con.query(`SELECT 
                        DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i') AS period, 
                        MIN(price) AS low, 
                        MAX(price) AS high, 
                        SUBSTRING_INDEX(GROUP_CONCAT(price ORDER BY timestamp), ',', 1) AS open, 
                        SUBSTRING_INDEX(GROUP_CONCAT(price ORDER BY timestamp DESC), ',', 1) AS close
                    FROM transactions
                    GROUP BY period
                    ORDER BY period ASC
                    LIMIT 50`, function(err, result) {
                        if (err) return reject(err);
                        resolve(result);
                    });
            });
        }

        // Fonction pour générer un graphique en chandeliers
        async function generateChart(data) {
            const canvas = createCanvas(800, 400);
            const ctx = canvas.getContext('2d');

            // Marges et dimensions
            const margin = 50;
            const width = (canvas.width - 2 * margin) / data.length; // Largeur des chandeliers
            const height = canvas.height - 2 * margin;
            const minPrice = Math.min(...data.map(item => item.l));
            const maxPrice = Math.max(...data.map(item => item.h));

            // Dessiner les axes
            ctx.beginPath();
            ctx.moveTo(margin, margin);
            ctx.lineTo(margin, canvas.height - margin);
            ctx.lineTo(canvas.width - margin, canvas.height - margin);
            ctx.strokeStyle = '#000';
            ctx.stroke();

            // Dessiner les chandeliers
            data.forEach((item, index) => {
                const x = margin + index * width;
                const open = item.o;
                const close = item.c;
                const high = item.h;
                const low = item.l;

                // Calculer les positions Y basées sur la plage des prix
                const openY = height - ((open - minPrice) / (maxPrice - minPrice)) * height;
                const closeY = height - ((close - minPrice) / (maxPrice - minPrice)) * height;
                const highY = height - ((high - minPrice) / (maxPrice - minPrice)) * height;
                const lowY = height - ((low - minPrice) / (maxPrice - minPrice)) * height;

                // Dessiner la ligne de hauteurs (high-low)
                ctx.beginPath();
                ctx.moveTo(x + width / 2, openY);
                ctx.lineTo(x + width / 2, closeY);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Dessiner le corps du chandelier
                ctx.beginPath();
                if (open > close) {
                    ctx.fillStyle = '#FF0000'; // Rouge si baisse
                } else {
                    ctx.fillStyle = '#00FF00'; // Vert si hausse
                }
                ctx.fillRect(x, Math.min(openY, closeY), width, Math.abs(openY - closeY));
                ctx.stroke();
            });

            return canvas.toBuffer('image/png');
        }

        try {
            // Récupérer les données des transactions
            const chartData = await getChartData();

            // Formatage des données pour le graphique
            const formattedData = chartData.map(item => ({
                o: parseFloat(item.open),
                h: parseFloat(item.high),
                l: parseFloat(item.low),
                c: parseFloat(item.close),
            }));

            // Générer le graphique
            const chartImage = await generateChart(formattedData);

            // Envoyer le graphique en tant qu'image dans Discord
            await interaction.reply({
                content: 'Voici le graphique des 50 dernières transactions :',
                files: [{ attachment: chartImage, name: 'chart.png' }],
            });
        } catch (error) {
            console.error('Erreur lors de la génération du graphique :', error);
            await interaction.reply('Désolé, il y a eu une erreur en générant le graphique.');
        }
    }
};
