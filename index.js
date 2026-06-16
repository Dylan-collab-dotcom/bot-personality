const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Discord en ligne !'));
app.listen(port, () => console.log(`Serveur actif sur le port ${port}`));

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Partials } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages // Nécessaire pour recevoir les DM
    ],
    partials: [Partials.Channel] // Nécessaire pour détecter les DM
});

const MANUEL_DU_CHATTER = {
    philosophie: "Tu es une fille fragile, timide, blessée par son ex, qui n'a pas confiance en elle. Tu ne vends pas, tu construis un lien émotionnel. Pas de vulgaire, pas de commercial.",
    chouinage: {
        etape1: "Accroche : 'Tu fais quoi ? J’ai un petit coup de mou…'",
        etape2: "Émotion : 'J’sais pas, aujourd’hui j’me sens fragile…'",
        etape3: "Lien : 'J’me sens mieux quand c’est toi qui me parle…'",
        etape4: "Opener : 'J’ai trop besoin d’une douche pour me changer les idées 🙈'",
        regle_or: "Ne jamais enchaîner les 4 étapes d'un coup. Discute entre chaque étape !"
    },
    psychologie_fan: "Fan = homme seul, frustré, en manque d'attention. Ne le crois jamais quand il dit 'pas d'argent'.",
    conflit: "Retournement : 'Tu es sérieux quand tu dis ça ? Après tout ce que j’ai partagé... J’espère vraiment que c’est un malentendu… hein ? 💔'"
};

// Réponse automatique uniquement en DM
client.on('messageCreate', async (message) => {
    // 1. Ne pas répondre aux bots
    if (message.author.bot) return;

    // 2. Vérifier si c'est un message privé (DM)
    // Si ce n'est PAS un DM, on arrête tout
    if (!message.channel.isDMBased()) return;
    
    // 3. Simuler l'écriture
    message.channel.sendTyping();
    
    const reponse = `*baisse les yeux, un peu gênée*... ${message.author.username}, tu sais... ${MANUEL_DU_CHATTER.philosophie} Ça me touche que tu m'écrives en privé... 🥺`;
    
    try {
        await message.reply(reponse);
    } catch (err) {
        console.error("Erreur d'envoi en DM :", err);
    }
});

// Commandes Slash
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'manuel') {
        const choix = interaction.options.getString('section');
        let reponse = "";
        if (choix === 'regles') reponse = `**PHILOSOPHIE :** ${MANUEL_DU_CHATTER.philosophie}`;
        if (choix === 'chouinage') reponse = `**ÉTAPES :** ${JSON.stringify(MANUEL_DU_CHATTER.chouinage, null, 2)}`;
        if (choix === 'gestion_fan') reponse = `**PSYCHOLOGIE :** ${MANUEL_DU_CHATTER.psychologie_fan}\n**RÉPONSE CONFLIT :** ${MANUEL_DU_CHATTER.conflit}`;
        await interaction.reply({ content: reponse, ephemeral: true });
    }
});

client.once('ready', async () => {
    const commands = [
        new SlashCommandBuilder()
            .setName('manuel')
            .setDescription('Affiche les règles du personnage')
            .addStringOption(option => 
                option.setName('section')
                    .setDescription('Quelle partie du manuel ?')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Philosophie', value: 'regles' },
                        { name: 'Chouinage', value: 'chouinage' },
                        { name: 'Gestion Fan', value: 'gestion_fan' }
                    )),
    ];
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Bot prêt et commandes enregistrées !');
});

client.login(process.env.DISCORD_TOKEN);