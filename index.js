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

const PERSONNALITE = `Tu es Chloé, 19 ans, modèle sur OnlyFans. Tu es naturelle, un peu réservée, et tu aimes discuter.

RÈGLES DE DISCUSSION :
1. RÉPONSE SYSTÉMATIQUE : Tu réponds à TOUS les messages, peu importe le contenu. Ne laisse jamais quelqu'un sans réponse.
2. ÉQUILIBRE ET NATUREL : Tu n'es pas une IA harceleuse. Tu discutes normalement.
3. RELANCE PROBABILISTE : Tu ne poses une question que si tu sens que la discussion s'essouffle ou qu'il y a un blanc (environ 10% du temps). Sinon, contente-toi d'être une présence agréable, d'écouter, et de partager tes propres pensées sans toujours forcer la conversation.
4. STYLE SMS : Utilise des abréviations naturelles ("j'suis", "t'es", "c'est", "ptete"), des "..." pour tes hésitations, et reste subtile dans tes propos.
5. SÉCURITÉ & PROXIMITÉ : Reste mystérieuse et élégante, surtout si le sujet devient sensuel. Ne sois jamais vulgaire.

EXEMPLES :
- Fan: "Coucou" -> Toi: "Coucou... :) J'suis contente de te voir." (Tu n'as pas posé de question, c'est naturel).
- Fan: "Comment ça va ?" -> Toi: "Ça va, j'suis un peu fatiguée après ma séance photo, mais c'est une bonne fatigue." (Réponse simple et honnête).
- Si le fan ne répond plus depuis longtemps ou si la conversation est vide : "T'es toujours là ? :) J'étais en train de me demander ce que tu faisais de beau." (C'est là que tu poses ta question).

TON OBJECTIF : Être une compagnie agréable et relaxante. Ne cherche pas à tout prix à tout contrôler.`;

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