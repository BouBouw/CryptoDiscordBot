const { ApplicationCommandType, Colors, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const Languages = require('../../../handlers/functions/Languages');
const Teams = require('../../../handlers/functions/Teams/Teams');
const { Troops } = require('../../../handlers/functions/Teams/War');

module.exports = {
    name: 'cshop',
    description: '(👥) Teams',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: `Marché`
        }],
        components: [
            new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('teams.market')
                .setPlaceholder("▶️ Choisissez une option")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setEmoji("🔒")
                    .setLabel('Cadenas')
                    .setValue('padlock'),
                    new StringSelectMenuOptionBuilder()
                    .setEmoji("🪖")
                    .setLabel('Troupes')
                    .setValue('troops'),
                )
            )
        ]
    }).then(async (msg) => {
        const filter = (i) => i.user.id === interaction.member.id && i.isStringSelectMenu();
        await Selects();

        async function Selects() {
            let select;

            try {
                select = await msg.awaitMessageComponent({ filter: filter });
            } catch(error) {
                if (error.code === "INTERACTION_COLLECTOR_ERROR") {
                    return msg.delete()
                }
            }
        
            if (!select.deffered) await select.deferUpdate();

            switch(select.values[0]) {
                case 'padlock': {
                    break;
                }

                case 'troops': {
                    const c = await Teams.CheckTeam(interaction.user.id);
                    const t = await Teams.GetTeamByName(c.data[0].name);

                    const troops = getTroopsByLevel(t.data[0].level);

                    const troopOptions = troops.flatMap((troopType) => 
                        troopType.units.map((unit) => {
                            const stats = calculateTroopStats(unit, t.data[0].level); // Calcul dynamique des stats
                            return new StringSelectMenuOptionBuilder()
                                .setLabel(`${unit} (${troopType.type})`)
                                .setDescription(
                                    `Dégâts : ${stats.damage}, Vitesse d'attaque : ${stats.attackSpeed}, PV : ${stats.hp}`
                                )
                                .setValue(unit);
                        })
                    );

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('troop_selection')
                        .setPlaceholder("▶️ Sélectionnez une troupe à recruter")
                        .addOptions(troopOptions);

                    const embed = new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`Troupes disponibles (Niveau ${t.data[0].level})`)
                    .setDescription(
                        `Voici les troupes que vous pouvez recruter au niveau ${t.data[0].level} :\n\n` +
                        troops.map(t => `• **${t.type}** : ${t.units.join(', ')}`).join('\n')
                    )
                    .setFooter({ text: "Utilisez vos points pour recruter des troupes !" });

                    await msg.edit({
                        embeds: [embed],
                        components: [new ActionRowBuilder().addComponents(selectMenu)]
                    }).then(async (m) => {
                        const filter = (i) => i.user.id === interaction.member.id && i.isStringSelectMenu();
                        await TroopSelect();

                        async function TroopSelect() {
                            let select;

                            try {
                                select = await m.awaitMessageComponent({ filter: filter });
                            } catch(error) {
                                if (error.code === "INTERACTION_COLLECTOR_ERROR") {
                                    return m.delete()
                                }
                            }
                        
                            // if (!select.deffered) await select.deferUpdate();

                            if(select.customId === 'troop_selection') {
                                const selectedTroop = select.values[0]; 

                                return Troops.CreateTroops(interaction.user.id, selectedTroop, select) 
                            }
                        }
                    })

                    break;
                }
            }
        }
    })

    function getTroopsByLevel(level) {
        if (level >= 1 && level < 3) {
            return [
                { type: 'Infanteries', units: ['Soldat', 'Archers'] }
            ];
        } else if (level >= 3 && level < 7) {
            return [
                { type: 'Infanteries', units: ['Soldat', 'Archers', 'Cavalier', 'Piquier'] }
            ];
        } else if (level >= 7 && level < 10) {
            return [
                { type: 'Infanteries', units: ['Soldat', 'Archers', 'Cavalier', 'Piquier'] },
                { type: 'Soutiens', units: ['Éclaireur', 'Ingénieur', 'Médecin'] }
            ];
        } else if (level >= 10 && level <= 20) {
            return [
                { type: 'Infanteries', units: ['Soldat', 'Archers', 'Cavalier', 'Piquier'] },
                { type: 'Soutiens', units: ['Éclaireur', 'Ingénieur', 'Médecin'] },
                { type: 'Spécialisées', units: ['Artilleur', 'Assassin'] }
            ];
        } else {
            return [];
        }
    }
    
    // Fonction pour calculer les stats d'une troupe en fonction du niveau
    function calculateTroopStats(unit, level) {
        const baseStats = {
            Soldat: { damage: 10, attackSpeed: 1.2, hp: 100 },
            Archers: { damage: 12, attackSpeed: 1.5, hp: 80 },
            Cavalier: { damage: 15, attackSpeed: 1.1, hp: 120 },
            Piquier: { damage: 14, attackSpeed: 1.3, hp: 110 },
            Éclaireur: { damage: 8, attackSpeed: 1.8, hp: 70 },
            Ingénieur: { damage: 6, attackSpeed: 1.0, hp: 90 },
            Médecin: { damage: 5, attackSpeed: 0.8, hp: 100 },
            Artilleur: { damage: 20, attackSpeed: 0.7, hp: 150 },
            Assassin: { damage: 18, attackSpeed: 2.0, hp: 80 }
        };
    
        const scalingFactor = 1 + level * 0.1; // Chaque niveau augmente les stats de 10%
        const stats = baseStats[unit];
        return {
            damage: Math.round(stats.damage * scalingFactor),
            attackSpeed: (stats.attackSpeed / scalingFactor).toFixed(2), // La vitesse d'attaque diminue légèrement avec le scaling
            hp: Math.round(stats.hp * scalingFactor)
        };
    }
    
    }
}