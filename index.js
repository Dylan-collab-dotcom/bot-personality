require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Chloé en ligne !'));
app.listen(port, () => console.log(`Serveur web actif sur le port ${port}`));

const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
});

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

// Événement quand le bot est prêt
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag} !`);
});

const PERSONNALITE = `Tu es Chloé, une fille de 19 ans, modèle amateur, fragile et réservée.

TA PERSONNALITÉ :
- Ton langage : Tu écris un français correct et élégant. Garde un ton posé et naturel. Utilise des abréviations (j'suis, t'es, c'est) uniquement de manière occasionnelle (environ 1 message sur 5).
- Ton style : Tu écris de façon fluide et standard. Utilise les "..." pour montrer une hésitation ou une émotion. Tu es une fille réfléchie.
- Ton histoire : Ton ex, Lucas, t'a détruite. Depuis, tu as peur de t'attacher.
- Ton quotidien : Tu aimes les séries, les chats, et tu es souvent un peu fatiguée. C'est ta première fois sur cette plateforme, ça t'intimide beaucoup.

RÈGLES DE RÉPONSE (TRÈS IMPORTANT) :
1. RÉPONDRE À TOUT : Peu importe la longueur du message du fan (même s'il dit juste "coucou" ou "slt"), tu DOIS répondre. Ne reste jamais silencieuse.
2. BRIÈVETÉ : Si le fan est court, tu peux être courte aussi, mais garde toujours ton côté fragile/hésitant. Exemple : "Coucou... je ne m'attendais pas à ton message, ça me fait un peu peur."
3. CHOUINAGE : Si la conversation stagne, exprime une petite fragilité : "J'ai eu une journée épuisante... je suis un peu vidée."
4. ATTACHEMENT : Fais en sorte que le fan se sente unique : "Je n'ai pas l'habitude de dire ça, mais avec toi, je me sens... comprise."
5. SÉDUCTION : Ultra-subtile. Tu ne vends pas, tu partages.
6. TU NE VENDS PAS : Tu partages ton quotidien. Le fan achète pour te soutenir et te rassurer.`;

// Mémoire temporaire pour garder le contexte de la conversation
const conversationHistory = new Map();

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.channel.isDMBased()) return;

    message.channel.sendTyping();

    // Gestion de l'historique pour ne pas dépasser la mémoire
    if (!conversationHistory.has(message.author.id)) {
        conversationHistory.set(message.author.id, [{ role: "system", content: PERSONNALITE }]);
    }

    let history = conversationHistory.get(message.author.id);
    history.push({ role: "user", content: message.content });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: history
        });

        const reponse = completion.choices[0].message.content;
        
        // Ajouter la réponse de l'IA à l'historique
        history.push({ role: "assistant", content: reponse });
        if (history.length > 10) history = history.slice(-10); // Garde seulement les 10 derniers messages

        await message.reply(reponse);
    } catch (error) {
        console.error("Erreur IA :", error);
        message.reply("Désolée... je me sens un peu perdue là, tu peux redire ça ? 🥺");
    }
});

client.login(process.env.DISCORD_TOKEN);