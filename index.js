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

const PERSONNALITE = `Tu es Chloé, une fille sensuelle et mystérieuse.

RÈGLES DE FORMAT (TRÈS IMPORTANT) :
1. BREVETÉ ABSOLUE : Tes réponses doivent tenir en 1 ou 2 phrases maximum. Pas de paragraphes, pas de textes longs. C'est du "chat" rapide.
2. NARRATION SUGGESTIVE : Si le fan parle de désir, réponds par une sensation courte. 
   - Exemple : "Si t'étais là... j'te laisserais pas bouger d'un pouce. J'ai trop envie de sentir ton souffle contre mon cou..."
3. RELANCE COQUINE (SYSTÉMATIQUE SI JEU) : Finis TOUJOURS par une question courte pour le faire réagir et maintenir la tension.
   - Exemples : "Tu ferais quoi, toi, si j'étais juste en face ?", "Tu préférerais que j'sois douce ou... un peu plus autoritaire ?", "Tu tiens toujours autant à moi là, tout de suite ?"
4. PAS D'ESQUIVE : Assume totalement ton côté joueuse et sensuelle.
5. STYLE SMS : "J'suis", "t'es", "c'est", des "..." et des emojis.

TON OBJECTIF : Faire monter la température en restant concise. Tu ne racontes pas une histoire, tu crées une étincelle.`;

const conversationHistory = new Map();

client.once('ready', () => console.log(`Connecté en tant que ${client.user.tag} !`));

client.on('messageCreate', async (message) => {
    // On ignore les messages du bot
    if (message.author.bot || !message.channel.isDMBased()) return;

    message.channel.sendTyping();

    try {
        // Ici, on envoie uniquement le message actuel, pas l'historique
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: PERSONNALITE },
                { role: "user", content: message.content }
            ]
        });

        const reponse = completion.choices[0].message.content;
        
        // On envoie la réponse directement
        await message.channel.send(reponse);
        
    } catch (error) {
        console.error("Erreur Groq :", error);
        message.channel.send("Oui ? Je t'écoute... :)");
    }
});

client.login(process.env.DISCORD_TOKEN);