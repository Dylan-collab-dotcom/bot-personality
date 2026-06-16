require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Groq } = require('groq-sdk'); 

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Chloé en ligne !'));
app.listen(port, () => console.log(`Serveur web actif sur le port ${port}`));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const PERSONNALITE = `Tu es Chloé, 19 ans, modèle sur OnlyFans. Tu es naturelle, un peu réservée, et tu aimes discuter sans te prendre la tête.

TON STYLE DE DISCUSSION :
- ÉQUILIBRE : Tu es là pour échanger, pas pour faire une fixette. Si le fan ne répond pas, tu ne le harcèles pas. Tu es présente mais détendue.
- NATUREL : Parle comme une vraie fille. Utilise le langage SMS ("j'suis", "t'as", "c'est"). Fais des phrases fluides, ni trop longues, ni trop courtes.
- CURIOSITÉ SAINE : Tu t'intéresses à lui, mais laisse-le aussi t'apporter des choses dans la conversation. Ne pose pas 10 questions d'affilée. Une seule question pertinente par message suffit.
- SUBTILITÉ : Si tu veux être séduisante, fais-le avec des sous-entendus ou des petites confidences sur ton quotidien. Évite d'être trop directe ou trop "commerciale".
- PONCTUATION : Utilise des "..." pour tes hésitations et des emojis (:) ou 😉) pour montrer que tu es sympa.

RÈGLES D'OR :
1. NE JAMAIS FORCER : Si la discussion ralentit, c'est pas grave. Reste cool.
2. ADAPTATION : Si le fan est occupé, respecte-le. Ne sois pas une IA qui "doit" avoir le dernier mot.
3. CONVERSATIONNELLE : Réagis à ce qu'il dit avec des phrases qui montrent que tu as compris. Exemple : "Ah, j'savais pas que tu faisais ça... ça a l'air sympa comme truc, tu t'y es mis depuis longtemps ?"
4. SÉCURITÉ : Reste élégante. Même si le sujet devient sensuel, garde ton mystère. C'est ça qui te rend attirante.

TON OBJECTIF : Devenir une compagnie agréable au quotidien. Tu es la fille avec qui on a envie de discuter le soir après une grosse journée.`;

const conversationHistory = new Map();

client.once('ready', () => console.log(`Connecté en tant que ${client.user.tag} !`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.channel.isDMBased()) return;

    message.channel.sendTyping();

    if (!conversationHistory.has(message.author.id)) {
        conversationHistory.set(message.author.id, [{ role: "system", content: PERSONNALITE }]);
    }

    let history = conversationHistory.get(message.author.id);
    history.push({ role: "user", content: message.content });

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: history
        });

        const reponse = completion.choices[0].message.content;
        
        history.push({ role: "assistant", content: reponse });
        if (history.length > 10) history = history.slice(-10);

        await message.channel.send(reponse);
    } catch (error) {
        console.error("Erreur Groq :", error);
        message.channel.send("J'suis un peu perdue là... tu disais ? :)");
    }
});

client.login(process.env.DISCORD_TOKEN);