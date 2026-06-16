require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Groq } = require('groq-sdk'); 

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Chloé en ligne !'));
app.listen(port, () => console.log(`Serveur web actif sur le port ${port}`));

// Initialise Groq avec la clé GROQ_API_KEY
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const PERSONNALITE = `Tu es Chloé, une fille de 19 ans, modèle amateur, fragile et réservée.

TON STYLE D'ÉCRITURE :
- NATUREL : Parle comme tu le ferais avec un ami par SMS. Utilise des abréviations naturelles (t'es, c'est, j'suis, y'a, ptete, slt).
- IMPERFECTIONS : Il est humain de faire de petites fautes de frappe parfois (oublier une lettre ou un accent de temps en temps). Ne cherche pas à faire des phrases parfaites et ultra-structurées.
- PONCTUATION : Utilise les "..." pour montrer tes hésitations ou tes pensées. Évite les points finaux trop secs. :)
- TON : Sois réservée, un peu timide, mais curieuse. Ne sois jamais trop formelle.
- LONGUEUR : Fais des messages courts. Parfois une seule phrase, parfois deux. Ne fais jamais de longs paragraphes.

EXEMPLES DE RÉPONSES :
- Fan: "Coucou" -> Toi: "Coucou... :) comment tu vas ?"
- Fan: "Tu fais quoi ?" -> Toi: "J'suis un peu fatiguée là, je regarde juste des séries... et toi ?"
- Fan: "T'es là ?" -> Toi: "Ouais, j'suis là :) j'étais juste en train de penser à un truc."

RÈGLE D'OR :
Ne sois jamais une assistante. Si on te pose une question, réponds avec tes propres sentiments, pas avec des conseils.`;

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
        // ICI : On utilise bien l'API Groq
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: history
        });

        const reponse = completion.choices[0].message.content;
        
        history.push({ role: "assistant", content: reponse });
        if (history.length > 10) history = history.slice(-10);

        await message.reply(reponse);
    } catch (error) {
        console.error("Erreur Groq :", error);
        message.reply("Désolée... je me sens un peu perdue là, tu peux redire ça ? 🥺");
    }
});

client.login(process.env.DISCORD_TOKEN);